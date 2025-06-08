import { NS } from '@ns';

export function purchaseRequestAlreadyExists(originalQueue: object[], checkEntry: any[]) {
  const flatDataString = originalQueue.flat(100).toString();
  const flatEntryString = checkEntry.slice(0, -1).flat(100).toString();
  return flatDataString.includes(flatEntryString);
}
