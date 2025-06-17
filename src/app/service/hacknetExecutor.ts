import {
  checkUpgradeStatus,
  getHacknetNodeData,
  getTotalHashProduction,
  initialiseHacknetNodeData,
  spendHashes,
  upgradeHacknetCacheOnMaxHashes,
} from '@/domain/hacknet/hacknetUtils';
import { purchaseRequest_hacknet } from '@/shared/purchaseRequestUtils';
import { initialiseTailWindow } from '@/shared/tailUtils';
import { fileExists } from '@/shared/validationUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  await initialiseTailWindow(ns);
  //ns.ui.closeTail();

  const file = '/data/locks/HacknetDatabaseLock.txt';
  if (fileExists(ns, file, 'home')) ns.rm(file, 'home');

  let nodeData = initialiseHacknetNodeData(ns);
  let nodeIterationCount = 0;

  // Wait until are able to buy first node.
  while (ns.hacknet.numNodes() === 0) {
    ns.print('Waiting to purchase first Node: $' + ns.formatNumber(ns.hacknet.getPurchaseNodeCost(), 2, 1000, true));
    await ns.sleep(1000);
    const firstNodeCost = ns.hacknet.getPurchaseNodeCost();
    if (ns.getServerMoneyAvailable('home') > firstNodeCost) ns.hacknet.purchaseNode();
    ns.clearLog();
  }

  // Main loop.
  while (true) {
    let canUpgrade = false;
    // Update Data.
    nodeData = await getHacknetNodeData(ns, nodeData);

    // Check if there is money available for the upgrade.
    const hacknetIncome = getTotalHashProduction(ns, nodeData);
    const earlyGameThreshold = 0.5;
    let phase = ns.getServerMoneyAvailable('home');
    let costMultiplier = 1;

    if (hacknetIncome >= earlyGameThreshold) {
      phase = nodeData[nodeIterationCount].moneyProfit;
      costMultiplier = (hacknetIncome * 0.1) / earlyGameThreshold;
    }
    const node = nodeData[nodeIterationCount];
    if (nodeData[nodeIterationCount].name !== '') {
      canUpgrade = checkUpgradeStatus(ns, 1, phase, node);
    }
    // Submit purchase request.
    if (canUpgrade) {
      await purchaseRequest_hacknet(ns, node, node.optimalUpgrade, nodeIterationCount, 1);
    }
    // Upgrade cheapest cache if hashes are close to being maxed out.
    await upgradeHacknetCacheOnMaxHashes(ns, nodeData);

    // Spend hashes.
    const spendAmount = Math.floor(ns.hacknet.numHashes() / 4);
    spendHashes(ns, 'Sell for Money', 'home', spendAmount);

    /// Increase nodeIterationCount, Sleep and refresh.
    nodeIterationCount++;
    if (nodeIterationCount === ns.hacknet.numNodes()) {
      nodeIterationCount = 0;
    }
    ns.print(node);
    await ns.sleep(1000);
    ns.clearLog();
  }
}
