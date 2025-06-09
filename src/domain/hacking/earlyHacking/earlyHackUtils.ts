import { fileExists } from '@/shared/validationUtils';
import { NS, Server } from '@ns';

export function recordServerHGWStats(ns: NS, server: string, increment: number) {
  const maxExtractionPercent = 0.75;
  let extractionPercent = increment;
  let securityProjection = 0;
  const serverMaxMoney = ns.getServerMaxMoney(server);

  //while (extractionPercent < maxExtractionPercent) {
  // Hack constants.
  let hackThreads = ns.hackAnalyzeThreads(server, extractionPercent);
  ns.print(hackThreads);
  if (hackThreads < 1) hackThreads = 1;
  securityProjection += ns.hackAnalyzeSecurity(hackThreads, server);
  // Grow constants.
  const remainingMoney = serverMaxMoney - ns.hackAnalyze(server) * hackThreads;
  //let growThreads = ns.formulas.hacking.

  extractionPercent += increment;
  //}
}

export function recordServerHGWCalculationsUsingFormulas(ns: NS, increment: number, serverList: string[]) {
  const player = ns.getPlayer();
  const maxExtractionPercent = 0.75;

  for (const server of serverList) {
    let extractionPercent = increment;
    let securityProjection = 0;
    const serverHGWData = [];

    const clone = createServerClone_perfectState(ns, server);
    if (!clone.moneyMax) return;

    //while (extractionPercent < maxExtractionPercent) {
    // Hack Calculations.
    const singleHackThreadPercent = ns.formulas.hacking.hackPercent(clone, player);
    let hackThreads = extractionPercent / singleHackThreadPercent;
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

    // Add info to serverHGWData.
    serverHGWData.push({ extractionPercent: extractionPercent });

    extractionPercent += increment;
    //}
  }
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
  const file = '/SystemDataStorage/ServerData/' + server + '.txt';
  await waitForUnlockServerFile(ns, server);
  lockServerFile(ns, server);
  ns.write(file, data.toString(), 'w');
  unlockServerFile(ns, server);
}

export async function safeReadServerFile(ns: NS, server: string) {
  const file = '/SystemDataStorage/ServerData/' + server + '.txt';
  await waitForUnlockServerFile(ns, server);
  lockServerFile(ns, server);
  const data = ns.read(file);
  unlockServerFile(ns, server);
}

async function waitForUnlockServerFile(ns: NS, server: string) {
  const file = '/SystemDataStorage/ServerData/' + server + '.txt';
  while (fileExists(ns, file, 'home')) {
    await ns.sleep(10);
  }
}

function lockServerFile(ns: NS, server: string) {
  const file = '/SystemDataStorage/ServerData/' + server + '.txt';
  if (!fileExists(ns, file, 'home')) {
    ns.write(file, 'lock', 'w');
  }
}

function unlockServerFile(ns: NS, server: string) {
  const file = '/SystemDataStorage/ServerData/' + server + '.txt';
  if (fileExists(ns, file, 'home')) {
    ns.rm(file, 'home');
  }
}
