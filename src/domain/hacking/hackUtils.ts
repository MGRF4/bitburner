import { NS } from '@ns';
import { fileExists } from '../../shared/validationUtils';

export function getOptimalHackingServer(ns: NS, serverList: string[]) {
  let bestServer = 'test';
  let bestValue = 0;
  for (const server of serverList) {
    attemptRootAccess(ns, server);
    if (!ns.hasRootAccess(server)) return bestServer;
    if (ns.getServerRequiredHackingLevel(server) <= ns.getPlayer().skills.hacking) {
      const maxMoney = ns.getServerMaxMoney(server);
      const hackChance = ns.formulas.hacking.hackChance(ns.getServer(server), ns.getPlayer());
      const hackTime = ns.formulas.hacking.hackTime(ns.getServer(server), ns.getPlayer());

      const value = (maxMoney * hackChance) / hackTime;

      if (value > bestValue) {
        bestServer = server;
        bestValue = value;
      }
    }
  }
  //if (bestServer === '') return ns.print(`Error optimalServer not found.`);
  return bestServer;
}

export async function getOptimisedServerList(ns: NS) {
  while (!fileExists(ns, '/data/serverLists/ServerListByH&M.txt', 'home')) {
    await ns.sleep(10);
  }
  if (!fileExists(ns, '/data/serverLists/ServerListByH&M.txt', 'home')) {
    return [];
  } else {
    return ns.read('/data/serverLists/ServerListByH&M.txt').split(',');
  }
}

function getNumberOfCrackingProgramsOwned(ns: NS) {
  const programs = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];

  let count = 0;
  for (const program of programs) {
    if (fileExists(ns, program, 'home')) count + 1;
  }
  return count;
}

export function copyFilesToServer(ns: NS, server: string, files: string[]) {
  for (const file of files) {
    if (!fileExists(ns, file, server)) {
      ns.scp(file, server, 'home');
    }
  }
}

export function decideHackGrowOrWeaken(ns: NS, optimalServer: string) {
  const maxMoney = ns.getServerMaxMoney(optimalServer);
  const currentMoney = ns.getServerMoneyAvailable(optimalServer);
  const minSec = ns.getServerMinSecurityLevel(optimalServer);
  const currentSec = ns.getServerSecurityLevel(optimalServer);

  if (currentSec > minSec) {
    return 'weaken';
  } else if (currentMoney < maxMoney) {
    return 'grow';
  } else {
    return 'hack';
  }
}

export function crackServerPortsAndNuke(ns: NS, server: string) {
  if (fileExists(ns, 'BruteSSH.exe', 'home')) ns.brutessh(server);
  if (fileExists(ns, 'FTPCrack.exe', 'home')) ns.ftpcrack(server);
  if (fileExists(ns, 'relaySMTP.exe', 'home')) ns.relaysmtp(server);
  if (fileExists(ns, 'HTTPWorm.exe', 'home')) ns.httpworm(server);
  if (fileExists(ns, 'SQLInject.exe', 'home')) ns.sqlinject(server);

  if (fileExists(ns, 'NUKE.exe', 'home')) ns.nuke(server);
}

export function attemptRootAccess(ns: NS, server: string) {
  if (!ns.hasRootAccess(server)) {
    const openPortsRequired = ns.getServerNumPortsRequired(server);
    const acquiredCrackCount = getNumberOfCrackingProgramsOwned(ns);
    if (openPortsRequired <= acquiredCrackCount) crackServerPortsAndNuke(ns, server);
  }
}
