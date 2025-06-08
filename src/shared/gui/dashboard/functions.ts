import { getColour } from '@/shared/colourUtils';
import { GUILabelList, ColourList, GUIDataList } from '@/shared/interfaces';
import { colourNumbersAndLetters } from '@/shared/stringUtils';
import { NS } from '@ns';

/*
 *
 */
export function renderGUILabelRow(ns: NS, characters: string[], labelList: GUILabelList, colourList: ColourList) {
  const bCol = getColour(ns, colourList.borderColour);
  const lCol = getColour(ns, colourList.labelColour);
  const rCol = getColour(ns, 'r');
  const [, , , , , , , , filledSpacer, emptySpacer] = characters;

  let line = '';
  for (let i = 0; i < labelList.labels.length; i++) {
    line += rCol + emptySpacer + lCol + labelList.labels[i] + rCol + emptySpacer;
    line += bCol + filledSpacer.repeat(labelList.dividerLengths[i]) + rCol;
  }
  return line;
}

/*
 *
 */
export function renderGUIDataRow(
  ns: NS,
  characters: string[],
  dataList: GUIDataList,
  colourList: ColourList,
  selectedColour?: any,
) {
  const bCol = getColour(ns, colourList.borderColour);
  let dCol = getColour(ns, colourList.dataColour);
  if (selectedColour) dCol = getColour(ns, selectedColour);
  const rCol = getColour(ns, 'r');
  const [, , , , , , , , , emptySpacer] = characters;

  let line = '';
  for (let i = 0; i < dataList.data.length; i++) {
    let formattedData = dataList.data[i];
    line += dCol + formattedData + rCol;
    line += bCol + emptySpacer.repeat(dataList.dividerLengths[i]) + rCol;
  }
  return line;
}

/*
 *
 */
export function renderRamGauge(
  ns: NS,
  width: number,
  maxRam: number,
  usedRam: number,
  usableRam: number,
  colourList: ColourList,
) {
  const bCol = getColour(ns, colourList.borderColour);
  const lCol = getColour(ns, colourList.labelColour);
  const rCol = getColour(ns, 'r');
  const critColour = getColour(ns, colourList.formatDashboardTitleColour);
  const block = '■';

  const gaugeLength = width - 20;
  const segmentSize = maxRam / gaugeLength;
  const usedSegments = Math.floor(usedRam / segmentSize);
  const usableRAMSegments = Math.floor(usableRam / segmentSize);

  let gauge = bCol + '[';

  for (let i = 0; i < gaugeLength; i++) {
    if (i === usableRAMSegments) {
      gauge += bCol + block;
    } else if (i < usedSegments) {
      gauge += i < usableRAMSegments ? lCol + block : critColour + block;
    } else {
      gauge += bCol + '=';
    }
  }
  gauge += bCol + ']' + rCol;

  return gauge;
}

/*
 *
 */
export function renderRamUsage(ns: NS, maxRam: number, usedRam: number, usableRam: number, colourList: ColourList) {
  const bCol = getColour(ns, colourList.borderColour);
  const lCol = getColour(ns, colourList.labelColour);
  const rCol = getColour(ns, 'r');
  let dynamicCol = colourList.labelColour;
  if (usedRam > usableRam) dynamicCol = colourList.criticalColour;

  let numberGauge =
    bCol +
    '( ' +
    colourNumbersAndLetters(ns, ns.formatRam(usedRam, 0), colourList, dynamicCol) +
    bCol +
    ' / ' +
    lCol +
    colourNumbersAndLetters(ns, ns.formatRam(usableRam, 0), colourList, colourList.labelColour) +
    bCol +
    ' | ' +
    lCol +
    colourNumbersAndLetters(ns, ns.formatRam(maxRam, 0), colourList, colourList.formatDashboardTitleColour) +
    bCol +
    ' )' +
    rCol;
  return numberGauge;
}

/*
 *
 */
export function mergeCharacters(
  topLeft: string,
  topRight: string,
  bottomLeft: string,
  bottomRight: string,
  horizontal: string,
  vertical: string,
  leftDivider: string,
  rightDivider: string,
  spaceFilled: string,
  spaceEmpty: string,
) {
  return [
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    horizontal,
    vertical,
    leftDivider,
    rightDivider,
    spaceFilled,
    spaceEmpty,
  ];
}

/*
 *
 */
export function mergeLabelList(...input: { labels: string[]; dividerLengths: number[] }[]) {
  return input;
}

/*
 *
 */
export function mergeDataList(...input: { data: (string | number)[]; dividerLengths: number[] }[]) {
  return input;
}

/*
 *
 */
export function mergeRenderQueue(
  ...input: (
    | 'emptySpacerLine'
    | 'filledSpacerLine'
    | 'labelLine'
    | 'dataLine'
    | 'ramGaugeLine'
    | 'ramUsageLine'
    | 'legendLine'
    | 'priorityLine'
    | 'moneyGaugeLine'
    | 'moneyFractionLine'
  )[]
) {
  return input;
}

/*
 *
 */
export function mergeColourList(
  titleColourNumber: number,
  borderColourNumber: number,
  labelColourNumber: number,
  dataColourNumber: number,
  criticalColourNumber: number,
  shadowColourNumber: number,
) {
  return {
    formatDashboardTitleColour: titleColourNumber,
    borderColour: borderColourNumber,
    labelColour: labelColourNumber,
    dataColour: dataColourNumber,
    criticalColour: criticalColourNumber,
    shadowColour: shadowColourNumber,
  };
}

/*
 *
 */
export function renderMoneyGauge(ns: NS, width: number, cost: number, inflatedCost: number, colourList: ColourList) {
  const bCol = getColour(ns, colourList.borderColour);
  const lCol = getColour(ns, colourList.labelColour);
  const rCol = getColour(ns, 'r');
  const critColour = getColour(ns, colourList.formatDashboardTitleColour);
  const block = '■';

  const gaugeLength = width;
  const segmentSize = inflatedCost / gaugeLength;
  const currentMoney = ns.getServerMoneyAvailable('home');
  const filledSegments = Math.floor(currentMoney / segmentSize);
  const costSegments = Math.floor(cost / segmentSize);

  let gauge = bCol + '[';

  for (let i = 0; i < gaugeLength; i++) {
    if (i === costSegments) {
      gauge += bCol + block;
    } else if (i < filledSegments) {
      gauge += i < costSegments ? lCol + block : critColour + block;
    } else {
      gauge += bCol + '=';
    }
  }
  gauge += bCol + ']' + rCol;

  return gauge;
}

/*
 *
 */
export function renderMoneyFractions(ns: NS, cost: number, inflatedCost: number, colourList: ColourList) {
  const bCol = getColour(ns, colourList.borderColour);
  const lCol = getColour(ns, colourList.labelColour);
  const rCol = getColour(ns, 'r');
  let dynamicCol = colourList.labelColour;
  const currentMoney = ns.getServerMoneyAvailable('home');
  if (currentMoney > cost) dynamicCol = colourList.criticalColour;

  let moneyGauge =
    bCol +
    '( $' +
    colourNumbersAndLetters(ns, ns.formatNumber(currentMoney, 2, 1000, true), colourList, dynamicCol) +
    bCol +
    ' / $' +
    lCol +
    colourNumbersAndLetters(ns, ns.formatNumber(cost, 2, 1000, true), colourList, colourList.labelColour) +
    bCol +
    ' | $' +
    lCol +
    colourNumbersAndLetters(
      ns,
      ns.formatNumber(inflatedCost, 2, 1000, true),
      colourList,
      colourList.formatDashboardTitleColour,
    ) +
    bCol +
    ' )' +
    rCol;
  return moneyGauge;
}
