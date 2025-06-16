import {
  createServerClone_perfectState,
  recordServerHGWCalculationsUsingFormulas,
  safeReadServerFile,
} from '@/domain/hacking/earlyHacking/earlyHackUtils';
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
    if (!ns.getServer(s).moneyAvailable) ns.print(s);
  }
  await recordServerHGWCalculationsUsingFormulas(ns, 0.1, list);
  //ns.print(temp);
  ns.print(' ');
  const temp = await safeReadServerFile(ns, 'foodnstuff');
  ns.print(temp);
  ns.print(' ');
}
