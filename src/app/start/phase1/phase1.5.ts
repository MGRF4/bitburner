import { initialiseTailWindow, resizeWindow, repositionWindow, phaseCompletionSequence } from '@/shared/tailUtils';
import { NS } from '@ns';

/*
 *  Phase 1
 *  Start: From the start of the game.
 *  End: When the first pServ is bought with max batches at the first hack% iterable.
 *
 *  1.5: Start hacknet.
 */

export async function main(ns: NS) {
  await initialiseTailWindow(ns, 'Phase1.5');

  resizeWindow(ns, 30, 50);
  repositionWindow(ns, 1700, 0);

  const script = 'app/service/hacknetExecutor.js';
  const scriptRam = ns.getScriptRam(script, 'home');
  const availableRam = ns.getServerMaxRam('home');

  if (scriptRam > availableRam) return ns.print('ERROR RAM FAILURE');
  ns.run(script);

  await phaseCompletionSequence(ns, 'Phase1.5 Complete', 1000, 'app/start/phase1/phase1.6.js');
}
