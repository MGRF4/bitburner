import { NS } from '@ns';
import { LastExecutedPurchaseInfo, PurchaseQueueInfo } from './models';

/*
 *
 */
export async function createPurchaseQueueInfo(ns: NS): Promise<PurchaseQueueInfo> {
  const data = new PurchaseQueueInfo(ns);
  await data.init();
  return data;
}

/*
 *
 */
export async function createLastExecutedPurchaseInfo(ns: NS): Promise<LastExecutedPurchaseInfo> {
  const data = new LastExecutedPurchaseInfo(ns);
  await data.init();
  return data;
}
