import { NS } from '@ns';
import { fileExists, serverExists } from './validationUtils';

/*
 *
 */
export function getScriptRam(ns: NS, script: string, host: string): number {
  if (!serverExists(ns, host)) {
    //ns.print(`ERROR: Host "${host}" does not exist.`);
    return 0;
  }
  if (!fileExists(ns, script, host)) {
    //ns.print(`ERROR: Script "${script}" not found on "${host}".`);
    return 0;
  }
  return ns.getScriptRam(script, host);
}

/*
 *
 */
export function getServerMaxRam(ns: NS, server: string) {
  if (!serverExists(ns, server)) {
    //ns.print(`ERROR: Host "${server}" does not exist.`);
    return 0;
  }
  return ns.getServerMaxRam(server);
}

/*
 *
 */
export function applyFreeRamPercentage(ns: NS, serverMaxRam: number) {
  if (serverMaxRam <= 0) return 0;
  const multiplier = 1 - parseInt(ns.read('/SystemDataStorage/FreeRAM%.txt')) / 100;
  return serverMaxRam * multiplier;
}

/*
 *
 */
export function getServerUsedRam(ns: NS, server: string) {
  if (!serverExists(ns, server)) return 0;
  return ns.getServerUsedRam(server);
}

/*
 *
 */
export function canExecuteScript(availableRam: number, neededRam: number) {
  if (availableRam > neededRam) return 'y';
  return 'n';
}
