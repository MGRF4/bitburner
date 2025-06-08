import { NS } from '@ns';
import { fileExists, isValidLeftRight, isValidThreadsRamPercentNone, isValidYesNo } from './validationUtils';
import { getColour } from './colourUtils';
import { ColourList } from './interfaces';

/*
 *
 */
export function formatDashboardTitleTemplate(
  ns: NS,
  watcherHost: string,
  templateSlots: number,
  titleDividerCharacterLeft: string,
  titleDividerCharacterRight: string,
  horizontalCharacter: string,
  colourList: ColourList,
) {
  const bCol = getColour(ns, colourList.borderColour);
  const tCol = getColour(ns, colourList.formatDashboardTitleColour);
  const rCol = getColour(ns, 'r');

  let template = bCol + titleDividerCharacterLeft + ' ' + tCol;

  if (watcherHost.length === templateSlots) {
    template += +watcherHost + ' ' + bCol + titleDividerCharacterRight;
  } else if (watcherHost.length < templateSlots) {
    template +=
      watcherHost +
      ' ' +
      bCol +
      titleDividerCharacterRight +
      horizontalCharacter.repeat(templateSlots - watcherHost.length);
  } else {
    template += watcherHost.slice(0, templateSlots) + ' ' + bCol + titleDividerCharacterRight;
  }
  return template;
}

/*
 *
 */
export function formatStringTemplate(templateSlots: number, pushSide: 'l' | 'r', stringToBeFormatted: string): string {
  if (!isValidLeftRight(pushSide)) return 'S'.repeat(templateSlots);
  if (stringToBeFormatted === ' ') return ' '.repeat(templateSlots);
  if (stringToBeFormatted.length == templateSlots) return stringToBeFormatted;
  if (stringToBeFormatted.length < templateSlots) {
    if (pushSide === 'l') return stringToBeFormatted + ' '.repeat(templateSlots - stringToBeFormatted.length);
    else return ' '.repeat(templateSlots - stringToBeFormatted.length) + stringToBeFormatted;
  }
  return stringToBeFormatted.slice(0, templateSlots);
}

/*
 *
 */
export function formatArgumentsTemplate(
  ns: NS,
  templateSlots: number,
  pushSide: 'l' | 'r',
  args: (string | number)[],
  colourList: ColourList,
): string {
  const critCol = getColour(ns, colourList.criticalColour);
  if (!isValidLeftRight(pushSide)) return 'S'.repeat(templateSlots);
  if (args.length == 0) return ' '.repeat(templateSlots);
  const line = args.toString().replaceAll("'", '').replaceAll(',', ' ').replaceAll('"', '');
  const difference = templateSlots - line.length;
  if (difference == 0) return line;
  else if (difference > 0) {
    if (pushSide === 'l') return line + ' '.repeat(difference);
    else return ' '.repeat(difference) + line;
  } else return line.slice(0, templateSlots - 3) + critCol + ' ++';
}
/*
 *
 */
export function formatNumberTemplate(
  ns: NS,
  templateSlots: number = 7,
  pushSide: 'l' | 'r',
  number: number,
  type: 'threads' | 'ram' | 'percent' | 'money' | 'none',
) {
  //if (number === 0) return ' '.repeat(templateSlots);
  if (!isValidLeftRight(pushSide)) return 'S'.repeat(templateSlots);
  if (!isValidThreadsRamPercentNone(type)) return 'T'.repeat(templateSlots);
  let formattedNumber: string;
  if (type === 'threads' && number > 0) formattedNumber = ns.formatNumber(number, 1, 1000, true);
  else if (type === 'ram' && number > 0) formattedNumber = ns.formatRam(number, 1);
  else if (type === 'percent') formattedNumber = ns.formatPercent(number, 0);
  else if (type === 'none') formattedNumber = ns.formatNumber(number, 2, 1000, true);
  else if (type === 'money') formattedNumber = '$' + ns.formatNumber(number, 2, 1000, true);
  else return ' '.repeat(templateSlots);

  if (formattedNumber.length == templateSlots) return formattedNumber;
  else if (formattedNumber.length < templateSlots) {
    if (pushSide === 'l') return formattedNumber + ' '.repeat(templateSlots - formattedNumber.length);
    else return ' '.repeat(templateSlots - formattedNumber.length) + formattedNumber;
  }
  return formattedNumber.slice(0, templateSlots);
}

/*
 *
 */
export function formatYesNoTemplate(templateSlots: number, input: string) {
  if (!isValidYesNo(input)) return ' '.repeat(templateSlots);
  else return input.toUpperCase();
}

/*
 *
 */
export function priorityTemplate(ns: NS, priority: number, script: string, host: string) {
  if (!fileExists(ns, script, host)) return ' ';
  return priority;
}

/*
 *
 */
export function getVisibleTextLength(input: string) {
  return input.replace(/\u001b\[[0-9;]*m/g, '').length;
}

/*
 *
 */
export function colourNumbersAndLetters(
  ns: NS,
  input: string,
  colourList: ColourList,
  selectColour: any = colourList.dataColour,
) {
  const bCol = getColour(ns, colourList.borderColour);
  const dCol = getColour(ns, selectColour);
  const rCol = getColour(ns, 'r');
  let numbers = [];
  let letters = [];
  for (let i = 0; i < input.length; i++) {
    if (!isNaN(Number(input[i])) || input[i] === '.') {
      numbers.push(input[i]);
    } else letters.push(input[i]);
  }
  return dCol + numbers.join('') + bCol + letters.join('') + rCol;
}
