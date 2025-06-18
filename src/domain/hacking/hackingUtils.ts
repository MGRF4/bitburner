import { fileExists } from '@/shared/validationUtils';
import { NS, Server } from '@ns';

export async function recordServerHGWCalculationsUsingFormulas(
  ns: NS,
  increment: number,
  serverList: string[],
): Promise<void> {
  const player = ns.getPlayer();
  const maxExtractionPercent = 0.75;

  for (const server of serverList) {
    let extractionPercent = increment;
    const serverHGWData = [];

    const clone = createServerClone_perfectState(ns, server);
    if (!clone.moneyMax) clone.moneyMax = 0;
    if (!clone.moneyAvailable) ns.print(clone.hostname);
    clone.moneyAvailable = clone.moneyMax;

    while (extractionPercent <= maxExtractionPercent) {
      extractionPercent = Number(extractionPercent.toFixed(3));
      let securityProjection = 0;

      // Hack Calculations.
      const singleHackThreadPercent = ns.formulas.hacking.hackPercent(clone, player);
      let hackThreads = Math.floor(extractionPercent / singleHackThreadPercent);
      if (hackThreads < 1) hackThreads = 1;
      securityProjection += ns.hackAnalyzeSecurity(hackThreads, clone.hostname);

      // Change clone money available.
      const stolenFraction = singleHackThreadPercent * hackThreads;
      const remainingMoney = clone.moneyMax * (1 - stolenFraction);
      clone.moneyAvailable = remainingMoney;

      // Grow Calculations.
      let growThreads = ns.formulas.hacking.growThreads(clone, player, clone.moneyMax, clone.cpuCores);
      securityProjection += ns.growthAnalyzeSecurity(growThreads, clone.hostname, clone.cpuCores);

      // Security Calculations.
      let securityThreads = Math.ceil(securityProjection / ns.weakenAnalyze(1, clone.cpuCores));

      // Calculate Ram needed for entire cycle.
      const hackRam = ns.getScriptRam('/domain/hacking/hackServer.js', 'home');
      const growRam = ns.getScriptRam('/domain/hacking/growServer.js', 'home');
      const weakenRam = ns.getScriptRam('/domain/hacking/weakenServer.js', 'home');
      const hackRamTotal = hackRam * hackThreads;
      const growRamTotal = growRam * growThreads;
      const weakenRamTotal = weakenRam * securityThreads;
      const totalRamNeeded = Math.ceil(hackRamTotal + growRamTotal + weakenRamTotal);
      const serverRamRequired = calculateServerRamNeeded(ns, totalRamNeeded);

      // Calculate money per second..
      const moneyTaken = clone.moneyMax * (singleHackThreadPercent * hackThreads);
      const hTime = ns.formulas.hacking.hackTime(clone, player);
      const gTime = ns.formulas.hacking.growTime(clone, player);
      const wTime = ns.formulas.hacking.weakenTime(clone, player);
      const totalTime = hTime + gTime + wTime;
      const rawMoneyPerTime = moneyTaken / totalTime;
      const moneyPerSecond = Math.round(rawMoneyPerTime * 10000);

      // Calculate cycles per batch.
      const batchTime = wTime;
      const cyclePerBatch = Math.floor(batchTime / 4);

      // Add info to serverHGWData.
      serverHGWData.push({
        extractionPercent: extractionPercent,
        hackThreads: hackThreads,
        growThreads: growThreads,
        weakenThreads: securityThreads,
        moneyPerSecond: moneyPerSecond,
        batchTime: batchTime / 1000,
        cyclesPerBatch: cyclePerBatch,
        ramNeeded: totalRamNeeded,
        serverRamNeeded: serverRamRequired,
      });

      extractionPercent += increment;
    }
    const refinedServerHGWData = removeInefficientHGWEntries(ns, serverHGWData);
    await safeWriteServerFile(ns, server, refinedServerHGWData);
  }
}

export function removeInefficientHGWEntries(ns: NS, inputArray: any[]) {
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

export function calculateServerRamNeeded(ns: NS, rawRam: number) {
  const maxRam = ns.getPurchasedServerMaxRam();
  for (let ram = 2; ram < maxRam + 1; ram = ram * 2) {
    if (ram > rawRam) return ram;
  }
  return maxRam;
}

export function createServerClone_perfectState(ns: NS, server: string): Server {
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
    baseDifficulty: s.minDifficulty,

    // Money
    moneyAvailable: s.moneyAvailable,
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
