import { NS } from '@ns';

export function fileExists(ns: NS, script: any, host: any): boolean {
  return ns.fileExists(script, host);
}

export function serverExists(ns: NS, host: any): boolean {
  return ns.serverExists(host);
}

export function isValidPriority(priority: any): boolean {
  return priority >= 0 && priority <= 9;
}

export function isValidThreads(threads: any): boolean {
  return threads > 0;
}

export function isValidYesNo(input: any): boolean {
  return input === 'n' || input == 'y';
}

export function isValidArguments(args: any): boolean {
  return Array.isArray(args);
}

export function isValidLeftRight(pushSide: any) {
  return pushSide === 'l' || pushSide == 'r';
}

export function isValidThreadsRamPercentNone(type: any) {
  return type === 'threads' || 'ram' || 'percent' || 'none';
}

export function isValidColourNumber(colourNumber: number) {
  return colourNumber >= 0 && colourNumber <= 255;
}

export function isValidString(input: any) {
  if (typeof input === 'string') return true;
  return false;
}

export function verifyVitalFiles(ns: NS) {
  const path = '/data/';
  const vitalFileList = [
    'MaxHack%Amount.txt',
    'Hack%Increment.txt',
    'FreeRAM%.txt',
    'CycleSyncTimeWindow.txt',
    'ColourPalette.txt',
  ];
  for (const file of vitalFileList) {
    if (!fileExists(ns, path + file, 'home'))
      return ns.print(
        `ERROR ${
          path + vitalFileList
        } does not exist, sugest running app/config/ConfigWizard.js or app/config/configColourPalette.js`,
      );
  }
}

export function isValidPriorityPortStructure(data: unknown): data is any[][] {
  return Array.isArray(data) && data.length === 10 && data.every((inner) => Array.isArray(inner));
}

export function isValidSingleArrayPortStructure(data: unknown): data is any[] {
  return Array.isArray(data);
}
