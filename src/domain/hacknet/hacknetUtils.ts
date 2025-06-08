import { purchaseRequest_hacknet } from '@/shared/purchaseRequestUtils';
import { HacknetNodeData } from '@/shared/types';
import { fileExists } from '@/shared/validationUtils';
import { NS } from '@ns';
import { commitCrime, getOptimalCrime } from '../crime/crimeUtils';

export function spendHashes(
  ns: NS,
  choice:
    | 'Sell for Money'
    | 'Sell for Corporation Funds'
    | 'Reduce Minimum Security'
    | 'Increase Maximum Money'
    | 'Improve Studying'
    | 'Improve Gym Training'
    | 'Exchange for Corporation Research'
    | 'Exchange for Bladeburner Rank'
    | 'Exchange for Bladeburner SP'
    | 'Generate Coding Contract'
    | 'Company Favor',
  subChoice: string,
  spendAmount: number,
) {
  ns.hacknet.spendHashes(choice, subChoice, spendAmount);
}

export async function upgradeHacknetCacheOnMaxHashes(ns: NS, nodeData: HacknetNodeData[]) {
  const numNodes = ns.hacknet.numNodes();
  if (numNodes === 0) return;
  if (ns.hacknet.numHashes() < ns.hacknet.hashCapacity() * 0.9) return;

  let cheapestNode = 0;
  let cheapestCache = ns.hacknet.getCacheUpgradeCost(0, 1);
  for (let i = 0; i < numNodes; i++) {
    const cacheCost = ns.hacknet.getCacheUpgradeCost(i);
    if (cacheCost < cheapestCache) {
      cheapestNode = i;
      cheapestCache = cacheCost;
    }
  }
  await purchaseRequest_hacknet(ns, nodeData[cheapestNode], 'cache', cheapestNode, 1);
}

export function initialiseHacknetNodeData(ns: NS) {
  const nodeData: HacknetNodeData[] = Array.from({ length: ns.hacknet.maxNumNodes() }, () => ({
    name: '',
    level: 0,
    levelCost: 0,
    levelExpense: 0,
    ram: 0,
    ramCost: 0,
    ramExpense: 0,
    cores: 0,
    coreCost: 0,
    coreExpense: 0,
    cache: 0,
    cacheCost: 0,
    cacheExpense: 0,
    hashPerSecond: 0,
    timeOnline: 0,
    totalHashes: 0,
    nodeExpense: 0,
    totalExpense: 0,
    usedRam: 0,
    hashProfit: 0,
    moneyProfit: 0,
    optimalUpgrade: '',
    optimalUpgradeCost: 0,
  }));
  return nodeData;
}

export async function getHacknetNodeData(ns: NS, nodeData: HacknetNodeData[]) {
  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    const s = ns.hacknet.getNodeStats(i);
    const n = nodeData[i];

    n.name = s.name;
    n.level = s.level;
    n.levelCost = getHacknetComponentCost(ns, i, 1, 'level') as number;
    n.levelExpense = getHacknetComponentExpense(ns, n.level, 'level');
    n.ram = s.ram;
    n.ramCost = getHacknetComponentCost(ns, i, 1, 'RAM');
    n.ramExpense = getHacknetComponentExpense(ns, n.ram, 'RAM');
    n.cores = s.cores;
    n.coreCost = getHacknetComponentCost(ns, i, 1, 'cores');
    n.coreExpense = getHacknetComponentExpense(ns, n.cores, 'cores');
    n.cache = s.cache as number;
    n.cacheCost = getHacknetComponentCost(ns, i, 1, 'cache');
    n.cacheExpense = getHacknetComponentExpense(ns, n.cache, 'cache');

    n.hashPerSecond = s.production;
    n.timeOnline = s.timeOnline;
    n.totalHashes = s.totalProduction;
    n.nodeExpense = getNodeCost(ns, i);
    n.totalExpense = getNodeExpenses(ns, n);
    n.moneyProfit = n.totalHashes - n.totalExpense;
    n.hashProfit = convertToHashes(n.moneyProfit);
    n.usedRam = s.ramUsed as number;
    n.optimalUpgrade = getOptimalComponentUpgrade(ns, n);
    n.optimalUpgradeCost = getUpgradeCost(ns, n.optimalUpgrade, n);
  }
  await safeWriteToHacknetDatabase(ns, nodeData);
  return nodeData;
}

function getUpgradeCost(
  ns: NS,
  upgradeName: string,
  nodeData: { levelCost: number; ramCost: number; coreCost: number },
) {
  switch (upgradeName) {
    case 'level':
      return nodeData.levelCost;

    case 'RAM':
      return nodeData.ramCost;

    case 'cores':
      return nodeData.coreCost;

    case 'node':
      return ns.formulas.hacknetServers.hacknetServerCost(
        ns.hacknet.numNodes() + 1,
        ns.getHacknetMultipliers().purchaseCost,
      );

    default:
      return 0;
  }
}

function getNodeCost(ns: NS, index: number) {
  return ns.formulas.hacknetServers.hacknetServerCost(index + 1, ns.getHacknetMultipliers().purchaseCost);
}

export function getNodeExpenses(
  ns: NS,
  nodeData: {
    levelExpense: number;
    ramExpense: number;
    coreExpense: number;
    cacheExpense: number;
    nodeExpense: number;
  },
): number {
  return (
    nodeData.levelExpense + nodeData.levelExpense + nodeData.ramExpense + nodeData.coreExpense + nodeData.nodeExpense
  );
}

function getHacknetComponentExpense(ns: NS, ownedAmount: number, component: 'level' | 'RAM' | 'cores' | 'cache') {
  switch (component) {
    case 'level':
      return ns.formulas.hacknetServers.levelUpgradeCost(1, ownedAmount - 1, ns.getHacknetMultipliers().levelCost);
    case 'RAM':
      return ns.formulas.hacknetServers.ramUpgradeCost(1, ownedAmount - 1, ns.getHacknetMultipliers().ramCost);
    case 'cores':
      return ns.formulas.hacknetServers.coreUpgradeCost(1, ownedAmount - 1, ns.getHacknetMultipliers().coreCost);
    case 'cache':
      return ns.formulas.hacknetServers.cacheUpgradeCost(1, ownedAmount - 1);
  }
}

function getOptimalComponentUpgrade(ns: NS, nodeData: HacknetNodeData) {
  const production = ns.getHacknetMultipliers().production;
  const hacknetServers = ns.formulas.hacknetServers;

  let bestHashRatePerDollar = 0;
  let bestComponent;

  let hashRatePerDollar;
  let component;

  if (nodeData.level !== hacknetServers.constants().MaxLevel) {
    const hashRate = hacknetServers.hashGainRate(
      nodeData.level + 1,
      nodeData.usedRam,
      nodeData.ram,
      nodeData.cores,
      production,
    );
    component = 'level';
    hashRatePerDollar = hashRate / nodeData.levelCost;
    //ns.print(hashRatePerDollar * 1000000000 + ' ' + hashRate);
    if (hashRatePerDollar > bestHashRatePerDollar) {
      bestHashRatePerDollar = hashRatePerDollar;
      bestComponent = component;
    }
  }

  if (nodeData.ram !== hacknetServers.constants().MaxRam) {
    const hashRate = hacknetServers.hashGainRate(
      nodeData.level,
      nodeData.usedRam,
      nodeData.ram + 1,
      nodeData.cores,
      production,
    );
    component = 'RAM';
    hashRatePerDollar = hashRate / nodeData.ramCost;
    //ns.print(hashRatePerDollar * 1000000000 + ' ' + hashRate);
    if (hashRatePerDollar > bestHashRatePerDollar) {
      bestHashRatePerDollar = hashRatePerDollar;
      bestComponent = component;
    }
  }
  if (nodeData.cores !== hacknetServers.constants().MaxCores) {
    const hashRate = hacknetServers.hashGainRate(
      nodeData.level,
      nodeData.usedRam,
      nodeData.ram,
      nodeData.cores + 1,
      production,
    );
    component = 'cores';
    hashRatePerDollar = hashRate / nodeData.coreCost;
    //ns.print(hashRatePerDollar * 1000000000 + ' ' + hashRate);
    if (hashRatePerDollar > bestHashRatePerDollar) {
      bestHashRatePerDollar = hashRatePerDollar;
      bestComponent = component;
    }
  }
  if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
    const hashRate = hacknetServers.hashGainRate(1, 0, 1, 1, production);
    component = 'node';
    hashRatePerDollar =
      hashRate / hacknetServers.hacknetServerCost(ns.hacknet.numNodes() + 1, ns.getHacknetMultipliers().purchaseCost);
    if (hashRatePerDollar > bestHashRatePerDollar) {
      bestHashRatePerDollar = hashRatePerDollar;
      bestComponent = component;
    }
  }

  if (bestComponent) return bestComponent;
  else return 'node';
}

function getHacknetComponentCost(
  ns: NS,
  index: number,
  upgradeAmount: number,
  component: 'level' | 'RAM' | 'cores' | 'cache',
) {
  switch (component) {
    case 'level':
      return ns.hacknet.getLevelUpgradeCost(index, upgradeAmount);

    case 'RAM':
      return ns.hacknet.getRamUpgradeCost(index, upgradeAmount);

    case 'cores':
      return ns.hacknet.getCoreUpgradeCost(index, upgradeAmount);

    case 'cache':
      return ns.hacknet.getCacheUpgradeCost(index, upgradeAmount);

    default:
      return Infinity;
  }
}

export function checkUpgradeStatus(ns: NS, costModifier: number, phase: any, nodeData: HacknetNodeData): boolean {
  const modifier = costModifier;
  const profit = phase;
  const upgradeCost = nodeData.optimalUpgradeCost * modifier;
  if (profit > upgradeCost) return true;
  return false;
}

function nodeExists(index: number) {
  return index - 1;
}

function convertToHashes(input: number) {
  return input / 250000;
}

async function waitForHacknetDatabaseUnlock(ns: NS) {
  const file = '/SystemDataStorage/HacknetDatabaseLock.txt';
  while (fileExists(ns, file, 'home')) {
    await ns.sleep(10);
  }
}

function lockHacknetDatabase(ns: NS) {
  const file = '/SystemDataStorage/HacknetDatabaseLock.txt';
  if (!fileExists(ns, file, 'home')) {
    ns.write(file, 'lock', 'w');
  }
}

function unlockHacknetDatabase(ns: NS) {
  const file = '/SystemDataStorage/HacknetDatabaseLock.txt';
  if (fileExists(ns, file, 'home')) {
    ns.rm(file, 'home');
  }
}

export async function safeWriteToHacknetDatabase(ns: NS, nodeData: HacknetNodeData[]) {
  const file = '/SystemDataStorage/HacknetDatabase.txt';
  await waitForHacknetDatabaseUnlock(ns);
  lockHacknetDatabase(ns);
  ns.write(file, JSON.stringify(nodeData), 'w');
  unlockHacknetDatabase(ns);
}

export async function safeGetHacknetDatabase(ns: NS) {
  const file = '/SystemDataStorage/HacknetDatabase.txt';
  await waitForHacknetDatabaseUnlock(ns);
  lockHacknetDatabase(ns);
  const raw = ns.read(file);
  unlockHacknetDatabase(ns);
  const data = JSON.parse(raw);
  return data;
}

export function getTotalHashProduction(ns: NS, nodeData: HacknetNodeData[]) {
  const numNode = ns.hacknet.numNodes();
  let totalProduction = 0;
  for (let i = 0; i < numNode; i++) {
    totalProduction += nodeData[i].hashPerSecond;
  }
  return totalProduction;
}

export async function getMoneyForFirstHacknode(ns: NS, moneyMakerChoice: string | 'crime') {
  if (ns.hacknet.maxNumNodes() == 0 || ns.hacknet.numNodes() > 0) return;
  switch (moneyMakerChoice) {
    case 'crime':
      commitCrime(ns, getOptimalCrime(ns));
      break;
  }
}
