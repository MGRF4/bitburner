import { getOptimalCrime, commitCrime } from '@/domain/crime/crimeUtils';
import { initialisePorts } from '@/infra/portUtils';
import { initialiseTailWindow, phaseCompletionSequence, repositionWindow, resizeWindow } from '@/shared/tailUtils';
import { NS } from '@ns';

/*
 *  Phase 1
 *  Start: From the start of the game.
 *  End: When the first pServ is bought with max batches at the first hack% iterable.
 *
 *  1.0: Clear and initialise ports, remove all invalid data.
 */

export async function main(ns: NS) {
  await initialiseTailWindow(ns, 'Phase1.0');

  resizeWindow(ns, 30, 50);
  repositionWindow(ns, 1700, 0);

  // Clear and initialise ports.
  for (let i = 1; i < 20; i++) {
    ns.getPortHandle(i).clear();
  }
  await initialisePorts(ns);

  // Remove all locks, serverData, serverLists.
  const lockList = ns.ls('home', '/data/locks/');
  const serverDataList = ns.ls('home', '/data/serverData/');
  const serverListsList = ns.ls('home', '/data/serverLists/');

  const combinedLists = lockList.concat(serverDataList, serverListsList);

  if (combinedLists.length > 0) {
    for (const item of combinedLists) {
      ns.rm(item, 'home');
    }
  }

  await phaseCompletionSequence(ns, 'Phase1.0 Complete', 1000, 'app/start/phase1/phase1.1.js');
}
