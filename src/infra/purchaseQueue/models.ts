import { NS } from '@ns';
import { initialisePorts, readPortSafely } from '../portUtils';

/*
 *
 */
export class PurchaseQueueInfo {
  storedQueueMAX = 6;
  storedQueue: any[] = [];
  queuePriorityCount: number[] = [];
  emptyEntry = [9, ' ', [], ' ', 0, 0, 0];
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }
  async init() {
    const data = await readPortSafely(this.ns, 3);
    if (data === null || data === undefined) await initialisePorts(this.ns);
    for (let p = 0; p < 10; p++) {
      // p for priority.
      this.queuePriorityCount.push(data[p].length);
      if (data[p] && data[p].length > 0 && this.storedQueue.length <= this.storedQueueMAX) {
        for (let e = 0; e < data[p].length; e++) {
          // e for entry.
          this.storedQueue.push(data[p][e]);
        }
      }
    }
    if (this.storedQueue.length < this.storedQueueMAX) {
      const difference = this.storedQueueMAX - this.storedQueue.length;
      for (let i = 0; i < difference; i++) {
        this.storedQueue.push(this.emptyEntry);
      }
    }
  }
  // Methods.
  entry(i: number) {
    return this.storedQueue[i];
  }
  priority(i: number) {
    return this.storedQueue[i][0];
  }
  name(i: number) {
    return this.storedQueue[i][1];
  }
  args(i: number) {
    return this.storedQueue[i][2];
  }
  purchaseMethod(i: number) {
    return this.storedQueue[i][3];
  }
  cost(i: number) {
    return this.storedQueue[i][4];
  }
  infCost(i: number) {
    return this.storedQueue[i][5];
  }
  startTime(i: number) {
    return this.storedQueue[i][6];
  }
  priorityCount() {
    return this.queuePriorityCount;
  }
}

/*
 *
 */
export class LastExecutedPurchaseInfo {
  lastPurchaseData: any;
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }
  async init() {
    const data = await readPortSafely(this.ns, 4);
    if (!Array.isArray(data)) await initialisePorts(this.ns);
    if (data.length == 0) {
      this.lastPurchaseData = [9, ' ', [], ' ', 0, 0, 0];
    } else {
      this.lastPurchaseData = data;
    }
  }
  priority() {
    return this.lastPurchaseData[0];
  }
  name() {
    return this.lastPurchaseData[1];
  }
  args() {
    return this.lastPurchaseData[2];
  }
  purchaseMethod() {
    return this.lastPurchaseData[3];
  }
  cost() {
    return this.lastPurchaseData[4];
  }
  infCost() {
    return this.lastPurchaseData[5];
  }
  timeInQueue() {
    return this.lastPurchaseData[6];
  }
}
