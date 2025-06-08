import { NS } from '@ns';
import { getColour } from './colourUtils';
import { getVisibleTextLength } from './stringUtils';
import { isValidLeftRight } from './validationUtils';

/*
 *
 */
export function getCurrentTimeInSeconds(): number {
  return Math.round(Date.now() / 1000);
}

/*
 *
 */
export function formatTimeFromSecondsWithColour(
  ns: NS,
  templateSlots: number,
  timeInSeconds: number,
  numberColour: number,
  suffixColour: number,
  colourCritical: number,
  pushSide: 'l' | 'r',
) {
  if (timeInSeconds < 0) timeInSeconds = 0;
  if (!isValidLeftRight(pushSide)) pushSide = 'r';
  const col1 = getColour(ns, numberColour);
  const col2 = getColour(ns, suffixColour);
  const colCrit = getColour(ns, colourCritical);
  const colR = getColour(ns, 'r');

  const hrs = getHoursFromSeconds(timeInSeconds);
  const min = getMinutesFromSeconds(timeInSeconds);
  const sec = getRemainingSeconds(timeInSeconds);

  let timeParts: string[] = [];

  if (hrs > 0) timeParts.push(`${col1}${hrs}${col2}h${colR}`);
  if (hrs > 0 || min > 0) timeParts.push(`${col1}${min}${col2}m${colR}`);
  if (hrs > 0 || min > 0 || sec > 0) timeParts.push(`${col1}${sec}${col2}s${colR}`);

  let timeString = timeParts.join(' ');
  if (timeString === '') timeString = ' '.repeat(templateSlots);
  const visibleLength = getVisibleTextLength(timeString);
  if (visibleLength === templateSlots) return timeString;
  else if (visibleLength < templateSlots) {
    if (pushSide === 'l') return timeString + ' '.repeat(templateSlots - visibleLength);
    else return ' '.repeat(templateSlots - visibleLength) + timeString;
  } else return colCrit + '+'.repeat(templateSlots);
}

/*
 *
 */
export function getHoursFromSeconds(timeInSeconds: number) {
  return Math.floor(timeInSeconds / 3600);
}

export function getMinutesFromSeconds(timeInSeconds: number) {
  return Math.floor((timeInSeconds % 3600) / 60);
}

export function getRemainingSeconds(timeInSeconds: number) {
  return timeInSeconds % 60;
}
