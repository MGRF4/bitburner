import { initialiseTailWindow } from '@/shared/tailUtils';
import { NS } from '@ns';

/*
 *  Phase 1
 *  Start: From the start of the game.
 *  End: When the first pServ is bought with max batches at the first hack% iterable.
 *
 *  1.1: Record all server lists.
 */

export async function main(ns: NS) {
  await initialiseTailWindow(ns);

  const pid = ns.run('app/scanNetwork.js');
  while (ns.isRunning(pid)) {
    await ns.sleep(10);
  }

  ns.spawn('app/start/phase1/phase1.2.js', { threads: 1, spawnDelay: 0 });
}
