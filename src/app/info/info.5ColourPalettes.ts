import { printColourPalette } from '@/shared/colourUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  ns.ui.openTail();
  ns.ui.setTailFontSize(12);
  ns.disableLog('ALL');
  ns.clearLog();

  printColourPalette(ns, 173, 222, 116, 81, 67);
  //colourPalette(ns, 16, 214, 180, 180, 228);
  //colourPalette(ns, 16, 52, 180, 214, 214);
  printColourPalette(ns, 214, 228, 180, 167, 67);
  printColourPalette(ns, 214, 214, 180, 67, 38);
  printColourPalette(ns, 36, 67, 38, 214, 167);
  printColourPalette(ns, 67, 180, 167, 213, 88);
  printColourPalette(ns, 220, 197, 213, 255, 159);
}
