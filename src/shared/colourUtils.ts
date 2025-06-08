import { NS } from '@ns';

/*
 *
 */
export function getColour(ns: NS, foregroundColour: any, backgroundColour?: number) {
  // Declare variables.
  let fColour;
  let bColour;
  let colourString = [];

  // Assign input dependent variables.
  // foregroundColour.
  if (foregroundColour == 'r' || typeof foregroundColour == 'number') {
    fColour = foregroundColour;
    if (typeof fColour == 'number' && (fColour < 0 || fColour > 255)) {
      ns.print('ERROR foregroundColour(arg1) is ' + fColour + " and is not 'r' or a number between '0 and 255'.");
      ns.exit();
    }
  } else {
    ns.print("ERROR foregroundColour(arg1) is not 'r' or of 'number' data type.");
    ns.exit();
  }
  // backgroundColour.
  if (backgroundColour != undefined) {
    bColour = backgroundColour;
    if (bColour < 0 || bColour > 255) {
      ns.print("ERROR backgroundColour(arg 2) number is not between '0 and 255' or leave empty.");
    }
  } else {
    bColour = 'n';
  }

  // Constructor.
  // Colour.
  colourString.push('\u001b[');
  if (bColour != 'n') {
    colourString.push('48;5;' + bColour + ';');
  }
  if (fColour == 'r') {
    colourString.push('0');
  } else {
    colourString.push('38;5;' + fColour);
  }
  colourString.push('m');

  // Return value.
  return colourString.join('');
}

/*
 *
 */
export function printColourPalette(
  ns: NS,
  number1: number,
  number2: number,
  number3: number,
  number4: number,
  number5: number,
) {
  const c1 = getColour(ns, number1, number1);
  const c2 = getColour(ns, number2, number2);
  const c3 = getColour(ns, number3, number3);
  const c4 = getColour(ns, number4, number4);
  const c5 = getColour(ns, number5, number5);

  const heightMAX = 6;
  const widthMAX = 30;
  const widthSEG = Math.floor(widthMAX / 5);

  for (let height = 0; height < heightMAX; height++) {
    let screenLine = [];
    for (let width = 0; width < widthMAX + 1; width++) {
      if (height >= 0 && height <= heightMAX) {
        if (width >= 0 && width <= widthSEG * 1 - 1) {
          screenLine.push(c1 + ' ');
        } else if (width >= widthSEG * 1 + 1 && width <= widthSEG * 2) {
          screenLine.push(c2 + ' ');
        } else if (width >= widthSEG * 2 + 1 && width <= widthSEG * 3) {
          screenLine.push(c3 + ' ');
        } else if (width >= widthSEG * 3 + 1 && width <= widthSEG * 4) {
          screenLine.push(c4 + ' ');
        } else if (width >= widthSEG * 4 + 1 && width <= widthSEG * 5 + 1) {
          screenLine.push(c5 + ' ');
        }
      }
    }
    ns.print(screenLine.join(''));
  }
  ns.print(' ');
}

/*
 *
 */
export function readColourPalette(ns: NS) {
  const raw = ns.read('/SystemDataStorage/ColourPalette.txt');
  const str = String(raw).trim();
  const numbers = str.length > 0 ? str.split(',').map((x) => Number(x.trim())) : [];
  return numbers as [number, number, number, number, number, number];
}
