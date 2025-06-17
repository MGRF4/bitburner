import { initialiseTailWindow, resizeWindow, repositionWindow, phaseCompletionSequence } from '@/shared/tailUtils';
import { NS } from '@ns';

/*
 *  Phase 1
 *  Start: From the start of the game.
 *  End: When the first pServ is bought with max batches at the first hack% iterable.
 *
 *  1.7: Deploy all services.
 */

export async function main(ns: NS) {
  await initialiseTailWindow(ns, 'Phase1.7');

  resizeWindow(ns, 30, 50);
  repositionWindow(ns, 1700, 0);

  const services = ns.ls('home', 'app/service/');

  for (const service of services) {
    if (!ns.scriptRunning(service, 'home')) {
      ns.run(service);
    }
  }

  // PLACEHOLDER
  ns.print('INFO: Unlinked phase1.8'); // remove this when extending the phase chain.
  // ^^^

  //await phaseCompletionSequence(ns, 'Phase1.7 Complete', 1000, 'app/start/phase1/phase1.8.js');
}
