import { initialiseTailWindow, phaseCompletionSequence, repositionWindow, resizeWindow } from '@/shared/tailUtils';
import { verifyVitalFiles } from '@/shared/validationUtils';
import { NS } from '@ns';

/*
 *  Phase 1
 *  Start: From the start of the game.
 *  End: When the first pServ is bought with max batches at the first hack% iterable.
 *
 *  1.1: Check and if needed, prompt for new vital config files.
 */

export async function main(ns: NS) {
  await initialiseTailWindow(ns, 'Phase1.1');

  resizeWindow(ns, 30, 50);
  repositionWindow(ns, 1700, 0);

  let pid;
  const hasFiles = verifyVitalFiles(ns);
  if (!hasFiles) {
    pid = ns.run('app/config/vitalFiles.js');
    if (pid < 1) return ns.print('ERROR FAILURE');
    while (ns.isRunning(pid)) {
      await ns.sleep(10);
    }
    pid = ns.run('app/config/colourPalette.js');
    if (pid < 1) return ns.print('ERROR FAILURE');
    while (ns.isRunning(pid)) {
      await ns.sleep(10);
    }
  }
  await phaseCompletionSequence(ns, 'Phase1.1 Complete', 1000, 'app/start/phase1/phase1.2.js');
}
