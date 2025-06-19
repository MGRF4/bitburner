import { initialiseTailWindow, resizeWindow, repositionWindow, phaseCompletionSequence } from '@/shared/tailUtils';
import { NS } from '@ns';

/*
 *  Phase 1
 *  Start: From the start of the game.
 *  End: When the first pServ is bought with max batches at the first hack% iterable.
 *
 *  1.4: Start basic early game hacking.
 */

export async function main(ns: NS) {
  await initialiseTailWindow(ns, 'Phase1.4');

  resizeWindow(ns, 30, 50);
  repositionWindow(ns, 1700, 0);

  const script = '/app/auxiliary/hacking/earlyHack.js';
  const scriptRam = ns.getScriptRam(script, 'home');
  const availableRam = ns.getServerMaxRam('home');

  if (scriptRam > availableRam) return ns.print('ERROR RAM FAILURE');
  ns.run(script);

  await phaseCompletionSequence(ns, 'Phase1.4 Complete', 1000, 'app/start/phase1/phase1.5.js');
}
