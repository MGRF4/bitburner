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
  ns.ui.setTailFontSize(12);

  // Start.
  ns.clearLog();
  ns.print(' ');
  await recordServerHGWCalculationsUsingFormulas(ns, 0.001, ['foodnstuff']);
  const temp = await safeReadServerFile(ns, 'foodnstuff');
  ns.print(temp);

  ns.print(ns.getServer('foodnstuff'));
}
