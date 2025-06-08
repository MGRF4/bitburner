import { NS } from '@ns';
import { getCurrentTimeInSeconds } from '@/shared/timeUtils';
import {
  applyFreeRamPercentage,
  canExecuteScript,
  getScriptRam,
  getServerMaxRam,
  getServerUsedRam,
} from '@/shared/ramUtils';

import {
  isValidPriority,
  serverExists,
  fileExists,
  isValidThreads,
  isValidYesNo,
  isValidArguments,
} from '@/shared/validationUtils';
import { initialisePorts, readPortSafely, writePortSafely, hasPortQueueEntries } from '../portUtils';
import { createScriptQueueInfo } from './modelUtils';
import { purchaseRequest_home } from '@/shared/purchaseRequestUtils';

/*
 *
 */
export async function addScriptToQueue(
  ns: NS,
  priority: number,
  script: string,
  host: string,
  threads: number,
  splitThreads: string,
  isolate: string,
  args: any,
) {
  // Run checks.
  if (!isValidPriority(priority)) return ns.print(`ERROR priority ${priority} is outside of Range (0 - 9)`);
  if (!serverExists(ns, host)) return ns.print(`ERROR host ${host} does not exist.`);
  if (!fileExists(ns, script, host)) return ns.print(`ERROR script ${script} does not exist on ${host}.`);
  if (!isValidThreads(threads)) return ns.print(`ERROR threads ${threads} are below 1.`);
  if (!isValidYesNo(splitThreads)) return ns.print(`ERROR splitThreads ${splitThreads} can be either 'y' or 'n'.`);
  if (!isValidYesNo(isolate)) return ns.print(`ERROR isolate ${isolate} can be either 'y' or 'n'.`);
  if (!isValidArguments(args)) return ns.print(`ERROR arguments ${args} are not of array type.`);

  // Initialise ports before a script gets added.
  await initialisePorts(ns);
  // Retrieve the current queue.
  let queue = await readPortSafely(ns, 1);
  // Build the entry.
  let entry = [priority, script, host, threads, splitThreads, isolate, args];
  // Add the current time to the entry.
  entry.push(getCurrentTimeInSeconds());
  // Insert the entry into the queue.
  queue[priority].push(entry);
  // Wait if there is no room in the queue.
  while (ns.getPortHandle(1).full()) {
    await ns.sleep(10);
  }
  // Write the queue back into the port.
  await writePortSafely(ns, 1, queue);
}

/*
 *
 */
export async function executeNextScriptInQueue(ns: NS) {
  // Check if there are any entries in the queue.
  if (!(await hasPortQueueEntries(ns, 1))) return;
  // Get data.
  let data = await createScriptQueueInfo(ns);
  const entry = data.entry(0);
  if (!entry) {
    ns.print(`Error0: No entry in queue`);
  }
  let [priority, script, host, threads, splitThreads, isolate, args, startTime] = entry as [
    number,
    string,
    string,
    number,
    string,
    string,
    any[],
    number,
  ];
  // Validate host and script.
  if (!serverExists(ns, host) && !fileExists(ns, script, host)) {
    ns.print(`Error1: ${host} doesn't exist and ${script} doesn't exist on ${host}.`);
    return;
  }
  // Copy script to host server.
  if (serverExists(ns, host) && !fileExists(ns, script, host) && fileExists(ns, script, 'home')) {
    ns.scp(script, host, 'home');
  }
  const maxUsableRam = applyFreeRamPercentage(ns, getServerMaxRam(ns, host));
  const availableRam = maxUsableRam - getServerUsedRam(ns, host);
  const scriptRam = getScriptRam(ns, script, host);
  let neededRam = scriptRam * threads;
  let pid = 0;

  let threadsNeedUpdating = 'n';
  let readyToExecute = canExecuteScript(availableRam, neededRam);
  let remainingThreads = threads;

  if (scriptRam > maxUsableRam || (readyToExecute == 'n' && splitThreads == 'n')) {
    ns.print(`Error2: RAM needed for 1 thread: ${scriptRam}, exceeds the available RAM ${maxUsableRam},`);
    ns.print(`or not enough Ram to run ${script} at ${threads} threads.`);
    await purchaseRequest_home(ns, 'RAM');
    return;
  } else if (readyToExecute == 'n' && splitThreads == 'y') {
    for (let t = threads; t > 0; t--) {
      if (scriptRam * t <= availableRam) {
        remainingThreads -= t;
        threads = t;
        threadsNeedUpdating = 'y';
        readyToExecute = canExecuteScript(availableRam, scriptRam * t);
        break;
      }
    }
  }
  if (readyToExecute == 'y') {
    pid = executeScriptAndGetPid(ns, script, host, threads, args);
  }
  if (pid > 0) {
    await logLastExecutedScript(ns, priority, script, host, threads, splitThreads, isolate, args, startTime);
    if (threadsNeedUpdating == 'y') {
      await updateScriptThreadCount(ns, remainingThreads);
    } else if (threadsNeedUpdating == 'n') {
      await removeFirstScriptFromQueue(ns);
    }
    if (isolate == 'y') {
      //await waitForScriptCompletion(ns, pid);
      lockScriptExecution(ns, pid);
    }
  } else {
    ns.print(`Error3: Failed to execute ${script} on ${host}, pid: ${pid}`);
    return;
  }
}

/*
 *
 */
export async function logLastExecutedScript(
  ns: NS,
  priority: number,
  script: string,
  host: string,
  threads: number,
  splitThreads: string,
  isolate: string,
  args: any[],
  startTime: number,
) {
  const timeTaken = getCurrentTimeInSeconds() - startTime;
  let ram;
  if (!serverExists(ns, host) || !fileExists(ns, script, host)) ram = 0;
  else {
    ram = getScriptRam(ns, script, host) * threads;
  }
  const log = [priority, script, host, threads, splitThreads, isolate, args, ram, timeTaken];
  await writePortSafely(ns, 2, log);
}

/*
 *
 */
export async function removeFirstScriptFromQueue(ns: NS) {
  let queue = await readPortSafely(ns, 1);
  for (let p = 0; p < 10; p++) {
    if (queue[p].length > 0) {
      queue[p].splice(0, 1);
      break;
    }
  }
  await writePortSafely(ns, 1, queue);
}

/*
 *
 */
export async function updateScriptThreadCount(ns: NS, number: number) {
  let queue = await readPortSafely(ns, 1);
  for (let p = 0; p < 10; p++) {
    if (queue[p].length > 0) {
      queue[p][0].splice(3, 1, number);
      break;
    }
  }
  await writePortSafely(ns, 1, queue);
}

/*
 *
 */
export async function waitForScriptCompletion(ns: NS, pid: number) {
  while (ns.isRunning(pid)) {
    await ns.sleep(250);
  }
}

/*
 *
 */
export function lockScriptExecution(ns: NS, pid: number) {
  if (ns.isRunning(pid)) {
    ns.write('/SystemDataStorage/ScriptExecutionLock.txt', pid.toString(), 'w');
  }
}

/*
 *
 */
export function unlockScriptExecution(ns: NS) {
  if (fileExists(ns, '/SystemDataStorage/ScriptExecutionLock.txt', 'home')) {
    const pid = Number(ns.read('/SystemDataStorage/ScriptExecutionLock.txt'));
    if (!ns.isRunning(pid)) {
      ns.rm('/SystemDataStorage/ScriptExecutionLock.txt');
    }
  }
}

/*
 *
 */
export function executeScriptAndGetPid(ns: NS, script: string, host: string, threads: number, args: any[]) {
  return ns.exec(script, host, threads, ...args);
}
