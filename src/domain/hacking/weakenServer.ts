import { NS } from '@ns';

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const wait = (ns.args[1] as number) ?? 0;

  await ns.sleep(wait);
  await ns.weaken(target);
}
