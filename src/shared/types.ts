export type PurchaseMethods =
  | 'home'
  | 'darknet'
  | 'server'
  | 'hacknet'
  | 'augmentation'
  | 'stockMarket'
  | 'corporation'
  | 'bladeburner';

export type HacknetNodeData = {
  name: string;
  level: number;
  levelCost: number;
  levelExpense: number;
  ram: number;
  ramCost: number;
  ramExpense: number;
  cores: number;
  coreCost: number;
  coreExpense: number;
  cache: number;
  cacheCost: number;
  cacheExpense: number;
  hashPerSecond: number;
  timeOnline: number;
  totalHashes: number;
  nodeExpense: number;
  totalExpense: number;
  usedRam: number;
  hashProfit: number;
  moneyProfit: number;
  optimalUpgrade: string;
  optimalUpgradeCost: number;
};
