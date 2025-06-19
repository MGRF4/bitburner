import { fileExists } from '@/shared/validationUtils';
import { NS, Server } from '@ns';
import { attemptRootAccess } from './hackUtils';

export async function recordServerHGWCalculationsUsingFormulas(ns: NS, serverList: string[]): Promise<void> {
  const player = ns.getPlayer();
  const maxExtractionPercent = 0.75;

  for (const server of serverList) {
    if (ns.getPlayer().skills.hacking < ns.getServerRequiredHackingLevel(server)) continue;
    attemptRootAccess(ns, server);
    if (!ns.hasRootAccess(server)) continue;
    let increment = 1;

    const serverHGWData = [];

    const clone = createServerClone_perfectState(ns, server);
    if (!clone.moneyMax) clone.moneyMax = 0;
    if (!clone.moneyAvailable) ns.print(clone.hostname);

    const singleHackThreadPercent = ns.formulas.hacking.hackPercent(clone, player);
    let extractionPercent = increment * singleHackThreadPercent;

    while (extractionPercent < maxExtractionPercent) {
      extractionPercent = increment * singleHackThreadPercent;
      extractionPercent = Number(extractionPercent.toFixed(3));
      let securityProjection = 0;
      clone.moneyAvailable = clone.moneyMax;

      // Hack Calculations.
      let hackThreads = increment;
      if (hackThreads < 1) hackThreads = 1;
      securityProjection += ns.hackAnalyzeSecurity(hackThreads, clone.hostname);

      // Change clone money available.
      const stolenFraction = singleHackThreadPercent * hackThreads;
      const remainingMoney = clone.moneyMax * (1 - stolenFraction);
      if (stolenFraction >= 1) break;
      clone.moneyAvailable = remainingMoney;

      // Grow Calculations.
      let growThreads = ns.formulas.hacking.growThreads(clone, player, clone.moneyMax, clone.cpuCores);
      securityProjection += ns.growthAnalyzeSecurity(growThreads, clone.hostname, clone.cpuCores);

      // Security Calculations.
      let securityThreads = Math.ceil(securityProjection / ns.weakenAnalyze(1, clone.cpuCores));

      // Calculate Ram needed for entire cycle.
      const hackRam = ns.getScriptRam('/app/auxiliary/hacking/hackServer.js', 'home');
      const growRam = ns.getScriptRam('/app/auxiliary/hacking/growServer.js', 'home');
      const weakenRam = ns.getScriptRam('/app/auxiliary/hacking/weakenServer.js', 'home');
      const hackRamTotal = hackRam * hackThreads;
      const growRamTotal = growRam * growThreads;
      const weakenRamTotal = weakenRam * securityThreads;

      // Calculate money per second..
      const moneyTaken = clone.moneyMax * (singleHackThreadPercent * hackThreads);
      const hTime = ns.formulas.hacking.hackTime(clone, player);
      const gTime = ns.formulas.hacking.growTime(clone, player);
      const wTime = ns.formulas.hacking.weakenTime(clone, player);
      const totalTime = hTime + gTime + wTime;
      const moneyPerSecondWeakenTime = (moneyTaken / (totalTime / 1000)).toFixed(2);

      // Calculate cycles per batch and server ram required for batching.
      const batchTime = 1000 + wTime + 1000;
      const cyclePerBatch = Math.floor(batchTime / 4000);
      const totalRamNeeded = Math.ceil((hackRamTotal + growRamTotal + weakenRamTotal) * cyclePerBatch * 2);
      const serverRamRequired = calculateServerRamNeeded(ns, totalRamNeeded);

      // Add info to serverHGWData.
      if (totalRamNeeded <= serverRamRequired) {
        serverHGWData.push({
          requiredLevel: clone.requiredHackingSkill,
          rootAccess: clone.hasAdminRights,
          extractionPercent: extractionPercent,
          moneyTaken: moneyTaken,
          hackThreads: hackThreads,
          growThreads: growThreads,
          weakenThreads: securityThreads,
          moneyPerSecond: moneyPerSecondWeakenTime,
          weakenTime: wTime,
          batchTime: batchTime,
          cyclesPerBatch: cyclePerBatch,
          ramNeeded: totalRamNeeded,
          serverRamNeeded: serverRamRequired,
        });
      }

      increment = increment * 2;
      await ns.sleep(250);
    }
    const refinedServerHGWData = removeInefficientHGWEntries(ns, serverHGWData);
    await safeWriteServerFile(ns, server, refinedServerHGWData);
  }
}

function removeInefficientHGWEntries(ns: NS, inputArray: any[]) {
  const reducedList = [];

  for (let i = 0; i < inputArray.length - 1; i++) {
    const target = inputArray[i];
    const nextTarget = inputArray[i + 1];
    if (target.serverRamNeeded < nextTarget.serverRamNeeded) {
      reducedList.push(target);
    }
  }
  reducedList.push(inputArray[inputArray.length - 1]);

  return reducedList;
}

function calculateServerRamNeeded(ns: NS, rawRam: number) {
  const maxRam = ns.getPurchasedServerMaxRam();
  for (let ram = 2; ram < maxRam + 1; ram = ram * 2) {
    if (ram > rawRam) return ram;
  }
  return maxRam;
}

function createServerClone_perfectState(ns: NS, server: string): Server {
  const s = ns.getServer(server);

  const serverClone: Server = {
    // Identification
    hostname: s.hostname,
    ip: s.ip,
    organizationName: s.organizationName,
    isConnectedTo: s.isConnectedTo,
    purchasedByPlayer: s.purchasedByPlayer,
    backdoorInstalled: s.backdoorInstalled,

    // Access & Ports
    hasAdminRights: s.hasAdminRights,
    numOpenPortsRequired: s.numOpenPortsRequired,
    openPortCount: s.openPortCount,
    sshPortOpen: s.sshPortOpen,
    ftpPortOpen: s.ftpPortOpen,
    smtpPortOpen: s.smtpPortOpen,
    httpPortOpen: s.httpPortOpen,
    sqlPortOpen: s.sqlPortOpen,

    // Hacking-related
    requiredHackingSkill: s.requiredHackingSkill,
    hackDifficulty: s.minDifficulty,
    minDifficulty: s.minDifficulty,
    baseDifficulty: s.baseDifficulty,

    // Money
    moneyAvailable: s.moneyMax,
    moneyMax: s.moneyMax,

    // Growth
    serverGrowth: s.serverGrowth,

    // RAM
    ramUsed: s.ramUsed,
    maxRam: s.maxRam,

    // Hardware
    cpuCores: s.cpuCores,

    // (There are a few other properties that exist on special servers,
    //  like scripts, messages, and contracts, but these are not needed
    //  for formulas and can be ignored for this context.)
  };
  return serverClone;
}

export async function safeWriteServerFile(ns: NS, server: string, data: any[]) {
  const file = '/data/serverData/' + server + '.txt';
  await waitForUnlockServerFile(ns, server);
  lockServerFile(ns, server);
  ns.write(file, JSON.stringify(data), 'w');
  unlockServerFile(ns, server);
}

export async function safeReadServerFile(ns: NS, server: string) {
  const file = '/data/serverData/' + server + '.txt';
  await waitForUnlockServerFile(ns, server);
  lockServerFile(ns, server);
  const data = JSON.parse(ns.read(file));
  unlockServerFile(ns, server);
  return data;
}

async function waitForUnlockServerFile(ns: NS, server: string) {
  const file = '/data/locks/' + server + '.txt';
  while (fileExists(ns, file, 'home')) {
    await ns.sleep(10);
  }
}

function lockServerFile(ns: NS, server: string) {
  const file = '/data/locks/' + server + '.txt';
  if (!fileExists(ns, file, 'home')) {
    ns.write(file, 'lock', 'w');
  }
}

function unlockServerFile(ns: NS, server: string) {
  const file = '/data/locks/' + server + '.txt';
  if (fileExists(ns, file, 'home')) {
    ns.rm(file, 'home');
  }
}
