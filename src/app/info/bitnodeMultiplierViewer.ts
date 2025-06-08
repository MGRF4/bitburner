import { getColour } from '@/shared/colourUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  ns.ui.openTail();
  //ns.ui.setTailTitle('');
  ns.ui.setTailFontSize(11);
  //ns.ui.resizeTail(447, 270);
  ns.disableLog('ALL');
  ns.clearLog();

  const nueCol = getColour(ns, 243);
  const posCol = getColour(ns, 33);
  const negCol = getColour(ns, 208);

  const templateSlots = 50;
  const multis = ns.getBitNodeMultipliers();
  const entries = Object.entries(multis);
  let colourChoice;

  for (let i = 0; i < entries.length; i += 2) {
    const [key1, value1] = entries[i];
    switch (true) {
      case value1 < 1:
        colourChoice = negCol;
        break;
      case value1 == 1:
        colourChoice = nueCol;
        break;
      case value1 > 1:
        colourChoice = posCol;
        break;
    }
    const pair1 = `${colourChoice}${key1}: ${value1}`;

    let pair2 = '';
    if (i + 1 < entries.length) {
      const [key2, value2] = entries[i + 1];
      switch (true) {
        case value2 < 1:
          colourChoice = negCol;
          break;
        case value2 == 1:
          colourChoice = nueCol;
          break;
        case value2 > 1:
          colourChoice = posCol;
          break;
      }
      pair2 = `${colourChoice}${key2}: ${value2}`;
    }
    ns.print(pair1.padEnd(templateSlots) + pair2);
  }
}
