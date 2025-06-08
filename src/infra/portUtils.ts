import { isValidPriorityPortStructure, isValidSingleArrayPortStructure } from '@/shared/validationUtils';
import { NS } from '@ns';

/*
 *
 */
export async function initialisePorts(ns: NS) {
  let portsInUse = 4;
  for (let i = 1; i <= portsInUse; i++) {
    let write;
    switch (i) {
      case 1:
        write = Array.from({ length: 10 }, () => []);
        break;
      case 2:
        write = [];
        break;
      case 3:
        write = Array.from({ length: 10 }, () => []);
        break;
      case 4:
        write = [];
        break;
    }
    const data = await readPortSafely(ns, i);
    if (i === 1 || i === 3) {
      if (isValidPriorityPortStructure(data)) {
        //ns.tprint(`Port ${i} is valid!`);
      } else {
        ns.tprint(`Port ${i} is INVALID or not initialized properly.`);
        writePortSafely(ns, i, write);
      }
    } else if (i === 2 || i === 4) {
      if (isValidSingleArrayPortStructure(data)) {
        //ns.tprint('Port 2 is valid: contains a single array.');
      } else {
        ns.tprint(`Port ${i} is invalid: does not contain a single array.`);
        writePortSafely(ns, i, write);
      }
    }
  }
}

/*
 *
 */
export function lockPort(ns: NS, portNumber: number): boolean {
  const lockFile = '/SystemDataStorage/Port-' + portNumber + '-Lock.txt';
  if (ns.fileExists(lockFile, 'home')) return false;
  ns.write(lockFile, 'locked', 'w');
  return true;
}

/*
 *
 */
export function unlockPort(ns: NS, portNumber: number): void {
  const lockFile = '/SystemDataStorage/Port-' + portNumber + '-Lock.txt';
  if (ns.fileExists(lockFile, 'home')) {
    ns.rm(lockFile);
  }
}

/*
 *
 */
export async function waitForPortUnlock(ns: NS, portNumber: number): Promise<void> {
  const lockFile = '/SystemDataStorage/Port-' + portNumber + '-Lock.txt';
  while (ns.fileExists(lockFile, 'home')) {
    await ns.sleep(50);
  }
}

/*
 *
 */
export async function writePortSafely(ns: NS, portNumber: number, data: any): Promise<void> {
  const lockFile = '/SystemDataStorage/Port-' + portNumber + '-Lock.txt';
  await waitForPortUnlock(ns, portNumber);

  lockPort(ns, portNumber);
  const port = ns.getPortHandle(portNumber);
  port.clear();
  port.write(data);
  unlockPort(ns, portNumber);
}

/*
 *
 */
export async function readPortSafely(ns: NS, portNumber: number): Promise<any> {
  const lockFile = '/SystemDataStorage/Port-' + portNumber + '-Lock.txt';
  await waitForPortUnlock(ns, portNumber);

  lockPort(ns, portNumber);
  const port = ns.getPortHandle(portNumber);
  const data = port.peek();
  unlockPort(ns, portNumber);

  if (data === 'NULL PORT DATA') return null;
  return data;
}

/*
 *
 */
export async function clearPortSafely(ns: NS, portNumber: number): Promise<void> {
  const lockFile = '/SystemDataStorage/Port-' + portNumber + '-Lock.txt';
  await waitForPortUnlock(ns, portNumber);

  lockPort(ns, portNumber);
  const port = ns.getPortHandle(portNumber);
  port.clear();
  unlockPort(ns, portNumber);
  await initialisePorts(ns);
}

/*
 *
 */
export async function hasPortQueueEntries(ns: NS, portNumber: number): Promise<boolean> {
  const queue = await readPortSafely(ns, portNumber);
  let count = 0;
  for (let p = 0; p < 10; p++) {
    count += queue[p].length;
  }
  return count > 0;
}
