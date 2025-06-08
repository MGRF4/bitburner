import { NS } from '@ns';

export function listLikeFiles(ns: NS, subString: string) {
  const list = ns.ls('home', subString);
  return list;
}

export function getCombinedRAM(ns: NS, serviceList: string[]) {
  let total = 0;
  for (const script of serviceList) {
    total += ns.getScriptRam(script, 'home');
  }
  return Math.ceil(total);
}
