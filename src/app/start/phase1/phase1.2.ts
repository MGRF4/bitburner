import { initialiseTailWindow, resizeWindow, repositionWindow, phaseCompletionSequence } from '@/shared/tailUtils';
import { NS } from '@ns';

/*
 *  Phase 1
 *  Start: From the start of the game.
 *  End: When the first pServ is bought with max batches at the first hack% iterable.
 *
 *  1.2: Record and store all network scanned native servers.
 */

export async function main(ns: NS) {
  await initialiseTailWindow(ns, 'Phase1.2');

  resizeWindow(ns, 30, 50);
  repositionWindow(ns, 1700, 0);

  let pid = ns.run('app/scanNetwork.js');
  if (pid < 1) return ns.print('ERROR FAILURE');
  while (ns.isRunning(pid)) {
    await ns.sleep(10);
  }
  await phaseCompletionSequence(ns, 'Phase1.2 Complete', 1000, 'app/start/phase1/phase1.3.js');
}
