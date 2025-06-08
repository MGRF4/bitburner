import { serverExists } from '@/shared/validationUtils';
import { NS } from '@ns';

export function purchaseRequester(ns: NS, args: any[], purchaseMethod: string) {
  let requestFulfilled: boolean = false;
  switch (purchaseMethod) {
    case 'home':
      requestFulfilled = handleHomePurchase(ns, args, purchaseMethod);
      break;

    case 'darknet':
      requestFulfilled = handleDarknetPurchase(ns, args, purchaseMethod);
      break;

    case 'server':
      requestFulfilled = handleServerPurchase(ns, args, purchaseMethod);
      break;

    case 'hacknet':
      requestFulfilled = handleHacknetPurchase(ns, args, purchaseMethod);
      break;

    case 'augmentation':
      requestFulfilled = ns.singularity.purchaseAugmentation(args[0], args[1]);
      break;

    case 'stockMarket':
      requestFulfilled = handleStockMarketPurchase(ns, args, purchaseMethod);
      break;

    case 'corporation':
      requestFulfilled = handleCorporationPurchase(ns, args, purchaseMethod);
      break;

    case 'bladeburner':
      requestFulfilled = handleBladeburnerPurchase(ns, args, purchaseMethod);
      break;

    default:
      ns.print(`ERROR (purchaseRequester()) uncaught ${purchaseMethod} error.`);
      break;
  }
  return requestFulfilled;
}

/*
 *
 */
function handleHomePurchase(ns: NS, args: any[], purchaseMethod: string) {
  let requestFulfilled = false;
  switch (args[0]) {
    case 'RAM':
      requestFulfilled = ns.singularity.upgradeHomeRam();
      break;
    case 'cores':
      requestFulfilled = ns.singularity.upgradeHomeCores();
      break;
    default:
      ns.print(`ERROR uncaught ${purchaseMethod} error.`);
      break;
  }
  return requestFulfilled;
}

function handleDarknetPurchase(ns: NS, args: any[], purchaseMethod: string) {
  let requestFulfilled = false;
  switch (args[0]) {
    case 'TOR':
      requestFulfilled = ns.singularity.purchaseTor();
      break;
    case 'program':
      requestFulfilled = ns.singularity.purchaseProgram(args[1]);
      break;
    default:
      ns.print(`ERROR uncaught ${purchaseMethod} error.`);
      break;
  }
  return requestFulfilled;
}

function handleServerPurchase(ns: NS, args: any[], purchaseMethod: string) {
  let requestFulfilled = false;
  let result;
  if (serverExists(ns, args[0])) {
    requestFulfilled = ns.upgradePurchasedServer(args[0], args[1]);
  } else {
    result = ns.purchaseServer(args[0], args[1]);
    if (result == args[0]) {
      requestFulfilled = true;
    }
  }
  return requestFulfilled;
}

function handleHacknetPurchase(ns: NS, args: any[], purchaseMethod: string) {
  let requestFulfilled = false;
  let result;
  switch (args[0]) {
    case 'level':
      requestFulfilled = ns.hacknet.upgradeLevel(args[1], args[2]);
      break;
    case 'RAM':
      requestFulfilled = ns.hacknet.upgradeRam(args[1], args[2]);
      break;
    case 'cores':
      requestFulfilled = ns.hacknet.upgradeCore(args[1], args[2]);
      break;
    case 'cache':
      requestFulfilled = ns.hacknet.upgradeCache(args[1], args[2]);
      break;
    case 'node':
      result = ns.hacknet.purchaseNode();
      if (result == -1) requestFulfilled = false;
      else if (result > -1) requestFulfilled = true;
      break;
    default:
      ns.print(`ERROR (handleHacknetPurchase()) uncaught ${purchaseMethod} error.`);
      break;
  }
  return requestFulfilled;
}

function handleStockMarketPurchase(ns: NS, args: any[], purchaseMethod: string) {
  let requestFulfilled = false;
  switch (args[0]) {
    case '4SMarketData':
      requestFulfilled = ns.stock.purchase4SMarketData();
      break;
    case '4SMarketDataTixApi':
      requestFulfilled = ns.stock.purchase4SMarketDataTixApi();
      break;
    case 'tixApi':
      requestFulfilled = ns.stock.purchaseTixApi();
      break;
    case 'wseAccount':
      requestFulfilled = ns.stock.purchaseWseAccount();
      break;
    default:
      ns.print(`ERROR uncaught ${purchaseMethod} error.`);
      break;
  }
  return requestFulfilled;
}

function handleCorporationPurchase(ns: NS, args: any[], purchaseMethod: string) {
  let requestFulfilled = false;
  switch (args[0]) {
    default:
      ns.print(`ERROR uncaught ${purchaseMethod} error.`);
      break;
  }
  return requestFulfilled;
}

function handleBladeburnerPurchase(ns: NS, args: any[], purchaseMethod: string) {
  let requestFulfilled = false;
  switch (args[0]) {
    default:
      ns.print(`ERROR uncaught ${purchaseMethod} error.`);
      break;
  }
  return requestFulfilled;
}
