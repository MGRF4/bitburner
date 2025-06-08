import {
  recordServerHGWCalculationsUsingFormulas,
  recordServerHGWStats,
} from '@/domain/hacking/earlyHacking/earlyHackUtils';
import { NS, Server } from '@ns';

export async function main(ns: NS) {
  ns.ui.openTail();
  ns.disableLog('ALL');
  // ns.clearLog();
  ns.ui.setTailFontSize(16);

  // Start.
  ns.print(' ');
  recordServerHGWCalculationsUsingFormulas(ns, 0.001, ['foodnstuff']);
  ns.print(' ');
}
