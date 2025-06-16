import { getCurrentTimeInSeconds } from '@/shared/timeUtils';
import { isValidPriority, isValidArguments, fileExists } from '@/shared/validationUtils';
import { NS } from '@ns';
import { hasPortQueueEntries, initialisePorts, readPortSafely, writePortSafely } from '../portUtils';
import { createPurchaseQueueInfo } from './modelUtils';
import { purchaseRequestAlreadyExists } from '../arrayUtils';
import { PurchaseMethods } from '@/shared/types';
import { purchaseRequester } from './purchaseUtils';

/*
 *
 */
export async function addPurchaseToQueue(
  ns: NS,
  priority: number,
  purchaseName: string,
  args: any[],
  purchaseMethod: PurchaseMethods,
  cost: number,
  infCost: number,
) {
  if (checkPurchaseRequestLock(ns)) return;
  let requestApproved = true;
  ns.print(requestApproved);
  // Run checks.
  if (!isValidPriority(priority)) {
    requestApproved = false;
    ns.print(`ERROR priority ${priority} is outside of Range (0 - 9)`);
  }
  if (!isValidArguments(args)) {
    requestApproved = false;
    return ns.print(`ERROR arguments ${args} are not of array type.`);
  }
  if (isNaN(cost)) {
    requestApproved = false;
    return ns.print(`ERROR cost ${cost} is not a number.`);
  }
  if (requestApproved === true) {
    // Initialise ports before a script gets added.
    await initialisePorts(ns);
    // Retrieve the current queue.
    let queue = await readPortSafely(ns, 3);
    // Build the entry.
    let entry = [priority, purchaseName, args, purchaseMethod, cost, infCost];
    // Add the current time to the entry.
    entry.push(getCurrentTimeInSeconds());
    // Check to see if the purchase request already exists in the queue.
    if (purchaseRequestAlreadyExists(queue, entry)) return;
    // Insert the entry into the queue.
    queue[priority].push(entry);
    // Wait if there is no room in the queue.
    while (ns.getPortHandle(1).full()) {
      await ns.sleep(10);
    }
    // Write the queue back into the port.
    // Wait for unlock then re-lock.
    await waitForPurchaseRequestUnlock(ns);
    await writePortSafely(ns, 3, queue);
    unlockPurchaseRequest(ns);
  } else {
    //ns.print('A');
  }
}

/*
 *
 */
export async function executeNextPurchaseInQueue(ns: NS) {
  // Wait until no purchases are being requested.
  while (fileExists(ns, '/data/locks/PurchaseRequestLock.txt', 'home')) {
    await ns.sleep(10);
  }
  // Check if there are any entries in the queue.
  if (!(await hasPortQueueEntries(ns, 3))) return;
  // Get data.
  let data = await createPurchaseQueueInfo(ns);
  const entry = data.entry(0);
  if (!entry) {
    ns.print(`Error0: No entry in queue`);
  }
  let [priority, name, args, purchaseMethod, cost, infCost, startTime] = entry as [
    number,
    string,
    any[],
    string,
    number,
    number,
    number,
  ];
  const currentMoney = ns.getServerMoneyAvailable('home');
  let canBuy = false;
  let sucessfulPurchase = false;
  if (currentMoney >= infCost) {
    canBuy = true;
  }
  if (canBuy === true) {
    sucessfulPurchase = purchaseRequester(ns, args, purchaseMethod);
  }
  if (sucessfulPurchase === true) {
    await logLastPurchase(ns, priority, name, args, purchaseMethod, cost, infCost, startTime);
    await removeFirstPurchaseFromQueue(ns);
  } else {
    ns.print(`ERROR (executeNextPurchaseInQueue()) ${priority} ${purchaseMethod} ${args} failed!`);
    return;
  }
}

/*
 *
 */
export async function logLastPurchase(
  ns: NS,
  priority: number,
  name: string,
  args: any[],
  purchaseMethod: string,
  cost: number,
  infCost: number,
  startTime: number,
) {
  const timeInQueue = getCurrentTimeInSeconds() - startTime;
  const log = [priority, name, args, purchaseMethod, cost, infCost, timeInQueue];
  await writePortSafely(ns, 4, log);
}

/*
 *
 */
export async function removeFirstPurchaseFromQueue(ns: NS) {
  let queue = await readPortSafely(ns, 3);
  for (let p = 0; p < 10; p++) {
    if (queue[p].length > 0) {
      queue[p].splice(0, 1);
      break;
    }
  }
  await writePortSafely(ns, 3, queue);
}

/*
 *
 */
export function lockPurchaseRequest(ns: NS) {
  ns.write('/data/locks/PurchaseRequestLock.txt', 'lock', 'w');
}

/*
 *
 */
export function unlockPurchaseRequest(ns: NS) {
  if (fileExists(ns, '/data/locks/PurchaseRequestLock.txt', 'home')) {
    ns.rm('/data/locks/PurchaseRequestLock.txt', 'home');
  }
}

/*
 *
 */
export async function waitForPurchaseRequestUnlock(ns: NS) {
  const file = '/data/locks/PurchaseRequestLock.txt';
  while (fileExists(ns, file, 'home')) {
    await ns.sleep(10);
  }
  lockPurchaseRequest(ns);
}

export function checkPurchaseRequestLock(ns: NS) {
  const file = '/data/locks/PurchaseRequestLock.txt';
  return fileExists(ns, file, 'home');
}
