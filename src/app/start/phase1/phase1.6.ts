import { initialiseTailWindow, resizeWindow, repositionWindow, phaseCompletionSequence } from '@/shared/tailUtils';
import { NS } from '@ns';

/*
 *  Phase 1
 *  Start: From the start of the game.
 *  End: When the first pServ is bought with max batches at the first hack% iterable.
 *
 *  1.6: Verify and enforce the ram needed for services to run.
 */

export async function main(ns: NS) {
  await initialiseTailWindow(ns, 'Phase1.6');

  resizeWindow(ns, 30, 50);
  repositionWindow(ns, 1700, 0);

  let availableRam = ns.getServerMaxRam('home');
  const serviceList = ns.ls('home', 'app/service/');
  let totalRamRequired = 0;
  for (const service of serviceList) {
    totalRamRequired += ns.getScriptRam(service);
  }

  let homeRamRequired = 0;
  let i = 2;
  while (true) {
    if (i > totalRamRequired) {
      homeRamRequired = i;
      break;
    } else {
      i = i * 2;
    }
  }

  while (availableRam < totalRamRequired) {
    availableRam = ns.getServerMaxRam('home');
    let cost = ns.formatNumber(ns.singularity.getUpgradeHomeRamCost(), 2, 1000, true);
    try {
      ns.singularity.upgradeHomeRam();
    } catch {
      ns.print(`INFO: Need $${cost}`);
    }
    await ns.sleep(1000);
  }

  await phaseCompletionSequence(ns, 'Phase1.6 Complete', 1000, 'app/start/phase1/phase1.7.js');
}
