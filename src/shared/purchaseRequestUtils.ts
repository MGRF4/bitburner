import { addPurchaseToQueue } from '@/infra/purchaseQueue/utils';
import { NS } from '@ns';
import { serverExists } from './validationUtils';
import { HacknetNodeData } from './types';

export async function purchaseRequest_home(ns: NS, subCatagory: 'RAM' | 'cores') {
  const priority = 5; // Add priority retrieving function.
  const inflationAmount = 1; // Add inflation retrieving function.

  let purchaseLine: any,
    information: string[] = [],
    cost: number;

  const currentHomeRam = ns.getServer('home').maxRam;
  const currentHomeCores = ns.getServer('home').cpuCores;

  switch (subCatagory) {
    case 'RAM':
      purchaseLine = 'Home upgrade: ' + ns.formatRam(currentHomeRam * 2, 0);
      information.push(subCatagory);
      cost = ns.singularity.getUpgradeHomeRamCost();
      break;

    case 'cores':
      purchaseLine = 'Home upgrade: ' + currentHomeCores * 2;
      information.push(subCatagory);
      cost = ns.singularity.getUpgradeHomeCoresCost();
      break;

    default:
      purchaseLine = `ERROR ${subCatagory} not found.`;
      information.push(ns.getScriptName());
      cost = 0;
      break;
  }
  await addPurchaseToQueue(ns, priority, purchaseLine, information, 'home', cost, cost * inflationAmount);
}

export async function purchaseRequest_darknet(ns: NS, subCatagory: 'TOR' | 'program', program?: string) {
  const priority = 5; // Add priority retrieving function.
  const inflationAmount = 1; // Add inflation retrieving function.

  let purchaseLine: any,
    information: string[] = [],
    cost: number;

  switch (subCatagory) {
    case 'TOR':
      purchaseLine = 'Router';
      information.push(subCatagory);
      cost = 200000;
      break;

    case 'program':
      purchaseLine = program as string;
      information.push(subCatagory, program as string);
      cost = ns.singularity.getDarkwebProgramCost(program as string);
      break;

    default:
      purchaseLine = `ERROR ${subCatagory} not found.`;
      information.push(ns.getScriptName());
      cost = 0;
      break;
  }
  await addPurchaseToQueue(ns, priority, purchaseLine, information, 'darknet', cost, cost * inflationAmount);
}

export async function purchaseRequest_server(ns: NS, serverName: string, upgradeRamTo: number) {
  const priority = 5; // Add priority retrieving function.
  const inflationAmount = 1; // Add inflation retrieving function.

  let purchaseLine: any,
    information: (string | number)[] = [],
    cost: number;

  switch (serverExists(ns, serverName)) {
    case true:
      purchaseLine = 'Upgrade ' + serverName + ' to ' + ns.formatRam(upgradeRamTo, 0) + ' RAM';
      information.push(serverName, upgradeRamTo);
      cost = ns.getPurchasedServerUpgradeCost(serverName, upgradeRamTo);
      break;

    case false:
      purchaseLine = 'Purchase ' + serverName + ' with ' + ns.formatRam(upgradeRamTo, 0) + ' RAM';
      information.push(serverName, upgradeRamTo);
      cost = ns.getPurchasedServerCost(upgradeRamTo);
      break;

    default:
      purchaseLine = `ERROR server existence uncaught.`;
      information.push(ns.getScriptName());
      cost = 0;
      break;
  }
  await addPurchaseToQueue(ns, priority, purchaseLine, information, 'server', cost, cost * inflationAmount);
}

export async function purchaseRequest_hacknet(
  ns: NS,
  nodeData: HacknetNodeData,
  subCatagory: string,
  hacknetNodeNumber?: number,
  amountOfUpgrades?: number,
) {
  const node = hacknetNodeNumber as number;
  const amount = amountOfUpgrades as number;
  const cost = nodeData.optimalUpgradeCost;
  const priority = 5; // Add priority retrieving function.
  const inflationAmount = 1; // Add inflation retrieving function.

  let purchaseLine: any;
  const information: (string | number)[] = [subCatagory];

  switch (subCatagory) {
    case 'node':
      purchaseLine = 'Hacknet Node';
      //information.push(subCatagory);
      break;

    case 'level':
      purchaseLine = `Hacknet-node-${node} Level: ${nodeData.level + amount}`;
      information.push(node, amount);
      break;

    case 'RAM':
      purchaseLine = 'Hacknet-node-' + node + ' RAM: ' + ns.formatRam(nodeData.ram + amount, 0);
      information.push(node, amount);
      break;

    case 'cores':
      purchaseLine = 'Hacknet-node-' + node + ' Cores: ' + (nodeData.cores + amount);
      information.push(node, amount);
      break;

    case 'cache':
      purchaseLine = 'Hacknet-node-' + node + ' Cache: ' + (nodeData.cache + amount);
      information.push(node, amount);
      break;

    default:
      purchaseLine = `ERROR (purchaseRequest_hacknet()) ${subCatagory} not found.`;
      information.push(ns.getScriptName());
      break;
  }

  await addPurchaseToQueue(ns, priority, purchaseLine, information, 'hacknet', cost, cost * inflationAmount);
}

export async function purchaseRequest_augmentation(ns: NS, faction: string, augmentation: string) {
  const priority = 5; // Add priority retrieving function.
  const inflationAmount = 1; // Add inflation retrieving function.

  const purchaseLine = augmentation + ' from ' + faction;
  const cost = ns.singularity.getAugmentationPrice(augmentation);

  await addPurchaseToQueue(
    ns,
    priority,
    purchaseLine,
    [faction, augmentation],
    'augmentation',
    cost,
    cost * inflationAmount,
  );
}

export async function purchaseRequest_stockMarket(
  ns: NS,
  subCatagory: '4SMarketData' | '4SMarketDataTixApi' | 'tixApi' | 'wseAccount',
) {
  const priority = 5; // Add priority retrieving function.
  const inflationAmount = 1; // Add inflation retrieving function.

  let purchaseLine: any,
    information: (string | number)[] = [],
    cost: number;

  switch (subCatagory) {
    case '4SMarketData':
      purchaseLine = 'Stock Market';
      information.push(subCatagory);
      cost = 1000000000;
      break;

    case '4SMarketDataTixApi':
      purchaseLine = 'Stock Market';
      information.push(subCatagory);
      cost = 25000000000;
      break;

    case 'tixApi':
      purchaseLine = 'Stock Market';
      information.push(subCatagory);
      cost = 5000000000;
      break;

    case 'wseAccount':
      purchaseLine = 'Stock Market';
      information.push(subCatagory);
      cost = 200000000;
      break;

    default:
      purchaseLine = `ERROR ${subCatagory} not found.`;
      information.push(ns.getScriptName());
      cost = 0;
      break;
  }
  await addPurchaseToQueue(ns, priority, purchaseLine, information, 'stockMarket', cost, cost * inflationAmount);
}

export async function purchaseRequest_corporation(ns: NS, subCatagory: string) {
  const priority = 5; // Add priority retrieving function.
  const inflationAmount = 1; // Add inflation retrieving function.

  let purchaseLine: any,
    information: (string | number)[] = [],
    cost: number;

  switch (subCatagory) {
    default:
      purchaseLine = `ERROR ${subCatagory} not found.`;
      information.push(ns.getScriptName());
      cost = 0;
      break;
  }
  await addPurchaseToQueue(ns, priority, purchaseLine, information, 'corporation', cost, cost * inflationAmount);
}

export async function purchaseRequest_bladeburner(ns: NS, subCatagory: string) {
  const priority = 5; // Add priority retrieving function.
  const inflationAmount = 1; // Add inflation retrieving function.

  let purchaseLine: any,
    information: (string | number)[] = [],
    cost: number;

  switch (subCatagory) {
    default:
      purchaseLine = `ERROR ${subCatagory} not found.`;
      information.push(ns.getScriptName());
      cost = 0;
      break;
  }
  await addPurchaseToQueue(ns, priority, purchaseLine, information, 'corporation', cost, cost * inflationAmount);
}
