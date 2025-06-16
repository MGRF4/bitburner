import { initialiseTailWindow } from '@/shared/tailUtils';
import { NS } from '@ns';

/*
 *  Phase 1
 *  Start: From the start of the game.
 *  End: When the first pServ is bought with max batches.
 */

export async function main(ns: NS) {
  await initialiseTailWindow(ns);

  //let phase1Complete = checkPhase1(ns);

  const thisScriptRam = ns.getScriptRam(ns.getScriptName(), ns.getServer().toString());
}
