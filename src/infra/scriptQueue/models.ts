import { NS } from '@ns';
import { initialisePorts, readPortSafely } from '../portUtils';

/*
 *
 */
export class ScriptQueueInfo {
  storedQueueMAX = 6;
  storedQueue: any[] = [];
  queuePriorityCount: number[] = [];
  emptyEntry = [9, ' ', ' ', 0, 'n', 'n', [], 0];

  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }
  async init() {
    const data = await readPortSafely(this.ns, 1);
    if (data === null || data === undefined) await initialisePorts(this.ns);
    for (let p = 0; p < 10; p++) {
      // p for priority.
      this.queuePriorityCount.push(data[p].length);
      if (data[p] && data[p].length > 0 && this.storedQueue.length <= this.storedQueueMAX) {
        for (let s = 0; s < data[p].length; s++) {
          // s for script.
          this.storedQueue.push(data[p][s]);
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
  script(i: number) {
    return this.storedQueue[i][1];
  }
  host(i: number) {
    return this.storedQueue[i][2];
  }
  threads(i: number) {
    return this.storedQueue[i][3];
  }
  splitThreads(i: number) {
    return this.storedQueue[i][4];
  }
  isolate(i: number) {
    return this.storedQueue[i][5];
  }
  args(i: number) {
    return this.storedQueue[i][6];
  }
  startTime(i: number) {
    return this.storedQueue[i][7];
  }
  priorityCount() {
    return this.queuePriorityCount;
  }
}

/*
 *
 */
export class LastExecutedScriptInfo {
  lastScriptData: any;
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }
  async init() {
    const data = await readPortSafely(this.ns, 2);
    if (!Array.isArray(data)) await initialisePorts(this.ns);
    if (data.length == 0) {
      this.lastScriptData = [9, ' ', ' ', 0, ' ', ' ', [], 0, 0];
    } else {
      this.lastScriptData = data;
    }
  }
  priority() {
    return this.lastScriptData[0];
  }
  script() {
    return this.lastScriptData[1];
  }
  host() {
    return this.lastScriptData[2];
  }
  threads() {
    return this.lastScriptData[3];
  }
  splitThreads() {
    return this.lastScriptData[4];
  }
  isolate() {
    return this.lastScriptData[5];
  }
  arguments() {
    return this.lastScriptData[6];
  }
  ram() {
    return this.lastScriptData[7];
  }
  timeTaken() {
    return this.lastScriptData[8];
  }
}
