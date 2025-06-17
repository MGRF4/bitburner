import {
  recordServerHGWCalculationsUsingFormulas,
  removeInefficientHGWEntries,
  safeReadServerFile,
} from '@/domain/hacking/hackingUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  ns.ui.openTail();
  ns.disableLog('ALL');
  // ns.clearLog();
  ns.ui.setTailFontSize(16);

  // Start.
  ns.clearLog();
  ns.print(' ');
  const list = ns.read('data/serverLists/ServerListByH&M.txt').split(',');
  for (const s of list) {
    if (isNaN(ns.getServerMoneyAvailable(s))) ns.print(s);
  }
  await recordServerHGWCalculationsUsingFormulas(ns, 0.001, ['foodnstuff']);
  //ns.print(temp);
  ns.print(' ');
  const temp = await safeReadServerFile(ns, 'foodnstuff');
  ns.print(temp);
  ns.print(' ');
  const reducedList = removeInefficientHGWEntries(ns, temp);
  ns.print(reducedList);
}
