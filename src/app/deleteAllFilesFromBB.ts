import { NS } from '@ns';

export async function main(ns: NS) {
  let host: string = (ns.args[0] as string) ?? 'home';
  const list = ns.ls(host);
  const scriptName = ns.getScriptName();
  for (const l of list) {
    if (l !== scriptName) {
      ns.rm(l, host);
    }
  }
}
