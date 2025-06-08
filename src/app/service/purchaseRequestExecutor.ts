import {
  executeNextPurchaseInQueue,
  unlockPurchaseRequest,
  waitForPurchaseRequestUnlock,
} from '@/infra/purchaseQueue/utils';
import { NS } from '@ns';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  while (true) {
    await waitForPurchaseRequestUnlock(ns);
    await executeNextPurchaseInQueue(ns);
    unlockPurchaseRequest(ns);

    await ns.sleep(1000);
    ns.clearLog();
  }
}
