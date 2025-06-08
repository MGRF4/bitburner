import { GUILabelList, GUIDataList, ColourList } from '@/shared/interfaces';
import { NS } from '@ns';
import {
  renderDashboardHeaderLine,
  renderSpacerLine,
  renderLabelLine,
  renderDataLine,
  renderRamGaugeLine,
  renderRamUsageLine,
  renderLegendLine,
  renderEndLine,
  renderPriorityCountLine,
  renderMoneyGaugeLine,
  renderMoneyFractionLine,
} from './dashboardLines';

export function renderDashboard(
  ns: NS,

  currentHost: string,
  headerTitle: string,
  maxDashboardWidth: number,
  renderQueue: string[],
  characters: string[],
  labelLists: GUILabelList[],
  dataLists: GUIDataList[],
  legend: string,
  colourList: ColourList,
  priorityCountData?: number[],
  purchaseData?: { cost: number; infCost: number },
) {
  const stringTemplateSlots = 25;

  let labelLineCount = 0;
  let dataLineCount = 0;

  /* Pre-render all lines */
  const headerLine = renderDashboardHeaderLine(
    ns,
    maxDashboardWidth,
    headerTitle,
    stringTemplateSlots,
    characters,
    colourList,
  );

  const emptySpacerLine = renderSpacerLine(ns, maxDashboardWidth, characters, colourList, 'y');

  const filledSpacerLine = renderSpacerLine(ns, maxDashboardWidth, characters, colourList, 'n');

  const labelLineQueue = [];
  for (const item of labelLists) {
    labelLineQueue.push(renderLabelLine(ns, maxDashboardWidth, characters, item, colourList));
  }

  const dataLineQueue = [];
  for (const item of dataLists) {
    dataLineQueue.push(renderDataLine(ns, maxDashboardWidth, stringTemplateSlots, characters, item, colourList));
  }

  const ramGaugeLine = renderRamGaugeLine(ns, maxDashboardWidth, currentHost, characters, colourList);

  const ramUsageLine = renderRamUsageLine(ns, maxDashboardWidth, currentHost, characters, colourList);

  const legendLine = renderLegendLine(ns, maxDashboardWidth, legend, characters, colourList);

  const endLine = renderEndLine(ns, maxDashboardWidth, characters, colourList);

  let priorityLine = renderSpacerLine(ns, maxDashboardWidth, characters, colourList, 'y');
  if (priorityCountData) {
    priorityLine = renderPriorityCountLine(ns, maxDashboardWidth, characters, colourList, priorityCountData);
  }

  let moneyGaugeLine = renderSpacerLine(ns, maxDashboardWidth, characters, colourList, 'y');
  let moneyFractionLine = renderSpacerLine(ns, maxDashboardWidth, characters, colourList, 'y');
  if (purchaseData) {
    moneyGaugeLine = renderMoneyGaugeLine(
      ns,
      maxDashboardWidth,
      purchaseData.cost,
      purchaseData.infCost,
      characters,
      colourList,
    );
    moneyFractionLine = renderMoneyFractionLine(
      ns,
      maxDashboardWidth,
      purchaseData.cost,
      purchaseData.infCost,
      characters,
      colourList,
    );
  }

  /* Order all lines in accordance with the sppecified render queue. */
  let queue = [];
  queue.push(headerLine, emptySpacerLine);
  for (const reading of renderQueue) {
    let line;
    switch (reading) {
      case 'emptySpacerLine':
        line = emptySpacerLine;
        break;
      case 'filledSpacerLine':
        line = filledSpacerLine;
        break;
      case 'labelLine':
        line = labelLineQueue[labelLineCount];
        labelLineCount++;
        break;
      case 'dataLine':
        line = dataLineQueue[dataLineCount];
        dataLineCount++;
        break;
      case 'ramGaugeLine':
        line = ramGaugeLine;
        break;
      case 'ramUsageLine':
        line = ramUsageLine;
        break;
      case 'legendLine':
        line = legendLine;
        break;
      case 'priorityLine':
        line = priorityLine;
        break;
      case 'moneyGaugeLine':
        line = moneyGaugeLine;
        break;
      case 'moneyFractionLine':
        line = moneyFractionLine;
        break;
    }
    queue.push(line);
  }
  queue.push(endLine);

  /* Print all lines in order */
  for (const line of queue) {
    ns.print(line);
  }
}
