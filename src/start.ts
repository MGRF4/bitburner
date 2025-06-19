import { NS } from '@ns';

export async function main(ns: NS) {
  ns.spawn('/app/start/phase1/phase1.0.js', { threads: 1, spawnDelay: 0 });
}
