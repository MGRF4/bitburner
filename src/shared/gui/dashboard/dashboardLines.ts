import { getColour } from '@/shared/colourUtils';
import { ColourList, GUILabelList, GUIDataList } from '@/shared/interfaces';
import { getServerMaxRam, getServerUsedRam, applyFreeRamPercentage } from '@/shared/ramUtils';
import { formatDashboardTitleTemplate, getVisibleTextLength, formatNumberTemplate } from '@/shared/stringUtils';
import { NS } from '@ns';
import {
  renderGUILabelRow,
  renderGUIDataRow,
  renderRamGauge,
  renderRamUsage,
  renderMoneyGauge,
  renderMoneyFractions,
} from './functions';

/*
 *
 */
export function renderDashboardHeaderLine(
  ns: NS,
  width: number,
  watcherHost: string,
  titleTemplateSlots: number,
  characters: string[] = [],
  colourList: ColourList,
) {
  const bCol = getColour(ns, colourList.borderColour);
  const rCol = getColour(ns, 'r');
  const [tl_Char, tr_char, , , horizontal, , dividerLeft, dividerRight, ,] = characters;

  let line =
    bCol +
    tl_Char +
    horizontal +
    rCol +
    formatDashboardTitleTemplate(
      ns,
      watcherHost,
      titleTemplateSlots,
      dividerLeft,
      dividerRight,
      horizontal,
      colourList,
    ) +
    bCol;
  const difference = width - (getVisibleTextLength(line) + 1); // 1 is from the extra horizontal.
  line += horizontal.repeat(difference) + tr_char + rCol;
  return line; // Change this after testing.
}

/*
 *
 */
export function renderSpacerLine(
  ns: NS,
  width: number,
  characters: string[],
  colourList: ColourList,
  emptySpace: 'y' | 'n',
) {
  const bCol = getColour(ns, colourList.borderColour);
  const spacerCol = getColour(ns, colourList.shadowColour);
  const rCol = getColour(ns, 'r');
  const [, , , , , vertical, , , filledSpacer, emptySpacer] = characters;

  let spacer = emptySpacer;
  if (emptySpace == 'n') spacer = filledSpacer;
  const line = bCol + vertical + spacerCol + spacer.repeat(width - 2) + bCol + vertical + rCol;
  return line; // Change this after testing.
}

/*
 *
 */
export function renderLabelLine(
  ns: NS,
  width: number,
  characters: string[],
  labelList: GUILabelList,
  colourList: ColourList,
) {
  const bCol = getColour(ns, colourList.borderColour);
  const rCol = getColour(ns, 'r');
  const [, , , , , vertical, , , filledSpacer] = characters;
  const leftShoulder = bCol + vertical + filledSpacer.repeat(2);
  const rightShoulder = bCol + filledSpacer.repeat(2) + vertical;
  const labelLine = renderGUILabelRow(ns, characters, labelList, colourList);
  const difference =
    width -
    (getVisibleTextLength(labelLine) + getVisibleTextLength(leftShoulder) + getVisibleTextLength(rightShoulder));

  if (labelList.labels.length != labelList.dividerLengths.length || difference < 0) {
    return `ERROR renderLabelLine() or differnce < 0.`;
  }

  let line = leftShoulder + labelLine + bCol + filledSpacer.repeat(difference) + rightShoulder + rCol;

  return line; // Change this after testing.
}

/*
 *
 */
export function renderDataLine(
  ns: NS,
  width: number,
  stringTemplateSlots: number,
  characters: string[],
  dataList: GUIDataList,
  colourList: ColourList,
  selectedColour?: any,
) {
  const bCol = getColour(ns, colourList.borderColour);
  let dCol = getColour(ns, colourList.dataColour);
  if (selectedColour) dCol = getColour(ns, selectedColour);
  const rCol = getColour(ns, 'r');
  const [, , , , , vertical, , , , emptySpacer] = characters;
  const leftShoulder = bCol + vertical + emptySpacer.repeat(3);
  const rightShoulder = bCol + emptySpacer.repeat(3) + vertical;
  const dataLine = renderGUIDataRow(ns, characters, dataList, colourList, selectedColour);
  const difference =
    width - (getVisibleTextLength(dataLine) + getVisibleTextLength(leftShoulder) + getVisibleTextLength(rightShoulder));
  if (dataList.data.length != dataList.dividerLengths.length || difference < 0) {
    return `ERROR renderDataLine() inputs: "${dataList.data.length}/${dataList.dividerLengths.length}" are of different lengths or difference < 0 "${difference}".`;
  }

  let line = leftShoulder + dataLine + bCol + emptySpacer.repeat(difference) + rightShoulder + rCol;

  return line;
}

/*
 *
 */
export function renderRamGaugeLine(
  ns: NS,
  width: number,
  watcherHost: string,
  characters: string[],
  colourList: ColourList,
) {
  const bCol = getColour(ns, colourList.borderColour);
  const lCol = getColour(ns, colourList.labelColour);
  const rCol = getColour(ns, 'r');
  const [, , , , , vertical, , , , emptySpacer] = characters;

  const maxRam = getServerMaxRam(ns, watcherHost);
  const usedRam = getServerUsedRam(ns, watcherHost);
  const usableRam = applyFreeRamPercentage(ns, maxRam);

  const gauge = renderRamGauge(ns, width, maxRam, usedRam, usableRam, colourList);
  const leftShoulder = bCol + vertical + emptySpacer.repeat(3) + lCol + 'Ram: ' + rCol;
  const rightShoulder = bCol + emptySpacer.repeat(3) + vertical + rCol;
  const percentage = lCol + formatNumberTemplate(ns, 4, 'r', usedRam / maxRam, 'percent');
  let line = leftShoulder + gauge + ' ' + percentage + rightShoulder;
  return line;
}

/*
 *
 */
export function renderRamUsageLine(
  ns: NS,
  width: number,
  watcherHost: string,
  characters: string[],
  colourList: ColourList,
) {
  const bCol = getColour(ns, colourList.borderColour);
  const rCol = getColour(ns, 'r');
  const [, , , , , vertical, , , , emptySpacer] = characters;

  const maxRam = getServerMaxRam(ns, watcherHost);
  const usedRam = getServerUsedRam(ns, watcherHost);
  const usableRam = applyFreeRamPercentage(ns, maxRam);
  const numberGauge = renderRamUsage(ns, maxRam, usedRam, usableRam, colourList);
  const leftShoulder = bCol + vertical + emptySpacer.repeat(3) + rCol;
  const rightShoulder = bCol + emptySpacer.repeat(3) + vertical + rCol;
  const difference =
    width -
    (getVisibleTextLength(numberGauge) + getVisibleTextLength(leftShoulder) + getVisibleTextLength(rightShoulder));
  let line =
    leftShoulder +
    emptySpacer.repeat(Math.floor(difference / 2)) +
    numberGauge +
    emptySpacer.repeat(Math.ceil(difference / 2)) +
    rightShoulder;
  return line;
}

/*
 *
 */
export function renderLegendLine(ns: NS, width: number, legend: string, characters: string[], colourList: ColourList) {
  const bCol = getColour(ns, colourList.borderColour);
  const sCol = getColour(ns, colourList.shadowColour);
  const rCol = getColour(ns, 'r');
  const [, , , , , vertical, , , , emptySpacer] = characters;
  const leftShoulder = bCol + vertical + emptySpacer.repeat(3) + sCol;
  const rightShoulder = bCol + emptySpacer.repeat(3) + vertical + rCol;
  const difference =
    width - (getVisibleTextLength(legend) + getVisibleTextLength(leftShoulder) + getVisibleTextLength(rightShoulder));
  const line = leftShoulder + emptySpacer.repeat(difference) + legend + rightShoulder;
  return line;
}

/*
 *
 */
export function renderEndLine(ns: NS, width: number, characters: string[], colourList: ColourList) {
  const bCol = getColour(ns, colourList.borderColour);
  const rCol = getColour(ns, 'r');
  const [, , bottomLeft, bottomRight, horizontal, , , , , ,] = characters;
  const difference = width - 2;
  const line = bCol + bottomLeft + horizontal.repeat(difference) + bottomRight + rCol;
  return line;
}

/*
 *
 */
export function renderPriorityCountLine(
  ns: NS,
  width: number,
  characters: string[],
  colourList: ColourList,
  priorityEntries: number[],
) {
  const bCol = getColour(ns, colourList.borderColour);
  const dCol = getColour(ns, colourList.dataColour);
  const lCol = getColour(ns, colourList.labelColour);
  const critCol = getColour(ns, colourList.criticalColour);
  const rcol = getColour(ns, 'r');
  const neutCol = getColour(ns, 245);
  const [, , , , , vertical, , , , emptySpacer] = characters;
  const leftShoulder = bCol + vertical + emptySpacer.repeat(3) + rcol;
  const rightShoulder = bCol + emptySpacer.repeat(3) + vertical + rcol;
  const difference = width - getVisibleTextLength(leftShoulder) - getVisibleTextLength(rightShoulder) - 5 * 10;
  const segDivider = Math.floor(difference / 9);
  let leftover = difference % 9;
  if (leftover < 0) leftover = 0;
  const leftPad = Math.floor(leftover / 2);
  const rightPad = leftover - leftPad;

  let line = leftShoulder + emptySpacer.repeat(leftPad);
  for (let i = 0; i < 10; i++) {
    let colour = dCol;
    if (priorityEntries[i] === 0) colour = neutCol;
    if (priorityEntries[i] > 99) {
      priorityEntries[i] = 99;
      colour = critCol;
    }
    const number = formatNumberTemplate(ns, 2, 'l', priorityEntries[i], 'none');
    if (i < 9) {
      line += bCol + 'P' + lCol + i + bCol + ':' + colour + number + rcol + emptySpacer.repeat(segDivider);
    } else if (i == 9) {
      line += bCol + 'P' + lCol + i + bCol + ':' + colour + number + rcol;
    }
  }
  line += emptySpacer.repeat(rightPad) + rightShoulder;
  return line;
}

/*
 *
 */
export function renderMoneyGaugeLine(
  ns: NS,
  width: number,
  cost: number,
  inflatedCost: number,
  characters: string[],
  colourList: ColourList,
) {
  const bCol = getColour(ns, colourList.borderColour);
  const lCol = getColour(ns, colourList.labelColour);
  const rCol = getColour(ns, 'r');
  const [, , , , , vertical, , , , emptySpacer] = characters;
  const currentMoney = ns.getServerMoneyAvailable('home');
  const gaugeWidth = width - 22;
  const gauge = renderMoneyGauge(ns, gaugeWidth, cost, inflatedCost, colourList);
  const leftShoulder = bCol + vertical + emptySpacer.repeat(3) + lCol + 'Money: ' + rCol;
  const rightShoulder = bCol + emptySpacer.repeat(3) + vertical + rCol;
  const percentage = lCol + formatNumberTemplate(ns, 4, 'r', currentMoney / inflatedCost, 'percent');
  let line = leftShoulder + gauge + ' ' + percentage + rightShoulder;
  return line;
}

/*
 *
 */
export function renderMoneyFractionLine(
  ns: NS,
  width: number,
  cost: number,
  inflatedCost: number,
  characters: string[],
  colourList: ColourList,
) {
  const bCol = getColour(ns, colourList.borderColour);
  const rCol = getColour(ns, 'r');
  const [, , , , , vertical, , , , emptySpacer] = characters;

  const fractionGauge = renderMoneyFractions(ns, cost, inflatedCost, colourList);
  const leftShoulder = bCol + vertical + emptySpacer.repeat(3);
  const rightShoulder = bCol + emptySpacer.repeat(3) + vertical + rCol;
  const difference = width - getVisibleTextLength(fractionGauge + leftShoulder + rightShoulder);
  let line =
    leftShoulder +
    emptySpacer.repeat(Math.floor(difference / 2)) +
    fractionGauge +
    emptySpacer.repeat(Math.ceil(difference / 2)) +
    rightShoulder;
  return line;
}
