import { getOptimisedServerList } from '@/domain/hacking/hackUtils';
import {
  assignTargetServersToPurchaseServers,
  getInitialTargetForBatching,
} from '@/domain/hacking/purchaseServerUtils';
import { recordServerHGWCalculationsUsingFormulas } from '@/domain/hacking/targetServerRecordingUtils';
import { initialiseTailWindow, simpleUpdateTail } from '@/shared/tailUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  await initialiseTailWindow(ns);
  ns.ui.setTailFontSize(15);

  // Exit if purchase server limit is 0.
  if (ns.getPurchasedServerLimit() < 1) ns.exit();

  // Retrieve serverList and assigned targetList.
  const serverList = await getOptimisedServerList(ns);
  assignTargetServersToPurchaseServers(ns, serverList);
  const list = JSON.parse(ns.read('/data/purchasedServer/assignedPurchasedServers.txt'));

  while (true) {
    // Record the initial target calculations.
    simpleUpdateTail(ns, 'Recording server info.');
    await recordServerHGWCalculationsUsingFormulas(ns, serverList);

    // acquire the best target at this time, find its pServer.
    simpleUpdateTail(ns, 'Deciding most efficient first target for batching.');
    let firstTarget = await getInitialTargetForBatching(ns, serverList);

    simpleUpdateTail(ns, 'Target is ' + firstTarget);
    await ns.sleep(10000);
    ns.clearLog();
  }
}
