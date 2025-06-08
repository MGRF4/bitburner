import { createLastExecutedPurchaseInfo, createPurchaseQueueInfo } from '@/infra/purchaseQueue/modelUtils';
import { readColourPalette } from '@/shared/colourUtils';
import { renderDashboard } from '@/shared/gui/dashboard/dashboardBuilder';
import {
  mergeRenderQueue,
  mergeLabelList,
  mergeColourList,
  mergeCharacters,
  mergeDataList,
} from '@/shared/gui/dashboard/functions';
import { formatStringTemplate, formatNumberTemplate, formatArgumentsTemplate } from '@/shared/stringUtils';
import { initialiseTailWindow, resizeWindow } from '@/shared/tailUtils';
import { getCurrentTimeInSeconds, formatTimeFromSecondsWithColour } from '@/shared/timeUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  await initialiseTailWindow(ns, ' ');

  // Declare Variables.
  const maxDashboardWidth = 80;
  const stringLength = 30;
  const headerTitle = 'Purchase Request Queue';
  const legend = 'Pri: priority   infCost: inflationCost';
  const currentHost = 'home';

  const renderQueue = mergeRenderQueue(
    'labelLine',
    'dataLine',
    'emptySpacerLine',
    'labelLine',
    'dataLine',
    'emptySpacerLine',
    'labelLine',
    'priorityLine',
    'emptySpacerLine',
    'moneyGaugeLine',
    'moneyFractionLine',
    'emptySpacerLine',
    'labelLine',
    'dataLine',
    'emptySpacerLine',
    'labelLine',
    'dataLine',
    'emptySpacerLine',
    'filledSpacerLine',
    'filledSpacerLine',
    'dataLine',
    'dataLine',
    'filledSpacerLine',
    'dataLine',
    'dataLine',
    'filledSpacerLine',
    'dataLine',
    'dataLine',
    'filledSpacerLine',
    'dataLine',
    'dataLine',
    'filledSpacerLine',
    'dataLine',
    'dataLine',
    'emptySpacerLine',
    'filledSpacerLine',
    'legendLine',
  );

  const labelList = mergeLabelList(
    { labels: ['Last Purchase Request', 'Pri', 'Cost', 'InfCost'], dividerLengths: [11, 10, 10, 0] },
    { labels: ['Details', 'Time in Queue'], dividerLengths: [50, 0] },
    { labels: ['Priority Count'], dividerLengths: [0] },
    { labels: ['Next Purchase Request', 'Pri', 'Cost', 'InfCost'], dividerLengths: [11, 10, 10, 0] },
    { labels: ['Details', 'Time in Queue'], dividerLengths: [50, 0] },
  );

  // Resize tail window.
  resizeWindow(ns, maxDashboardWidth, 650);
  // Start loop.
  while (true) {
    const colourList = mergeColourList(...readColourPalette(ns));
    const characters = mergeCharacters('╭', '╮', '╰', '╯', '─', '│', '┤', '├', '╌', ' ');

    // Get data for last purchase.
    const lastData = await createLastExecutedPurchaseInfo(ns);
    const lastPurchaseName = lastData.name();
    const lastPurchasePriority = lastData.priority();
    const lastPurchaseCost = lastData.cost();
    const lastPurchaseInfCost = lastData.infCost();
    const lastPurchaseArgs = lastData.args();
    const lastPurchaseTime = lastData.timeInQueue();

    // Get data for purchase queue.
    const purchaseRequestQueueData = await createPurchaseQueueInfo(ns);
    const dataEntries = [];
    for (let i = 0; i < 6; i++) {
      const [priority, name, args, method, cost, infCost, startTime] = purchaseRequestQueueData.entry(i);
      const time = getCurrentTimeInSeconds() - startTime;
      dataEntries.push({ priority, name, args, method, cost, infCost, time });
    }

    // Get data for priority counts.
    const priorityCountData = purchaseRequestQueueData.priorityCount();

    // Get last purchase templates.
    const lastPurchaseNameTemp = formatStringTemplate(stringLength, 'l', lastPurchaseName);
    let lastPurchasePriorityTemp = formatNumberTemplate(ns, 1, 'l', lastPurchasePriority, 'none');
    let lastPurchaseCostTemp = formatNumberTemplate(ns, 10, 'r', lastPurchaseCost, 'money');
    let lastPurchaseInfCostTemp = formatNumberTemplate(ns, 10, 'r', lastPurchaseInfCost, 'money');
    const lastPurchaseArgsTemp = formatArgumentsTemplate(ns, stringLength, 'l', lastPurchaseArgs, colourList);
    const lastPurchaseTimeTemp = formatTimeFromSecondsWithColour(
      ns,
      15,
      lastPurchaseTime,
      colourList.criticalColour,
      colourList.shadowColour,
      colourList.criticalColour,
      'r',
    );
    if (lastPurchaseNameTemp == ' '.repeat(stringLength)) {
      lastPurchasePriorityTemp = ' ';
      lastPurchaseCostTemp = ' ';
      lastPurchaseInfCostTemp = ' ';
    }

    // Get queued purchase requests templates.
    const dataTemplates: any[] = [];
    for (let i = 0; i < 6; i++) {
      const data = dataEntries[i];
      const name = formatStringTemplate(stringLength, 'l', data.name);
      let priority = formatNumberTemplate(ns, 1, 'l', data.priority, 'none');
      let cost = formatNumberTemplate(ns, 10, 'r', data.cost, 'money');
      let infCost = formatNumberTemplate(ns, 10, 'r', data.infCost, 'money');
      const args = formatArgumentsTemplate(ns, stringLength, 'l', data.args, colourList);
      let time = formatTimeFromSecondsWithColour(
        ns,
        15,
        data.time,
        colourList.criticalColour,
        colourList.shadowColour,
        colourList.criticalColour,
        'r',
      );
      if (name == ' '.repeat(stringLength)) {
        priority = ' ';
        cost = ' ';
        infCost = ' ';
        time = ' ';
      }
      dataTemplates.push({ name, priority, cost, infCost, args, time });
    }

    // Construct data lines from templates.
    const dataList = mergeDataList(
      {
        data: [lastPurchaseNameTemp, lastPurchasePriorityTemp, lastPurchaseCostTemp, lastPurchaseInfCostTemp],
        dividerLengths: [5, 7, 9, 0],
      },
      { data: [lastPurchaseArgsTemp, lastPurchaseTimeTemp], dividerLengths: [27, 0] },
      {
        data: [dataTemplates[0].name, dataTemplates[0].priority, dataTemplates[0].cost, dataTemplates[0].infCost],
        dividerLengths: [5, 7, 9, 0],
      },
      { data: [dataTemplates[0].args, dataTemplates[0].time], dividerLengths: [27, 0] },
      {
        data: [dataTemplates[1].name, dataTemplates[1].priority, dataTemplates[1].cost, dataTemplates[1].infCost],
        dividerLengths: [5, 7, 9, 0],
      },
      { data: [dataTemplates[1].args, dataTemplates[1].time], dividerLengths: [27, 0] },
      {
        data: [dataTemplates[2].name, dataTemplates[2].priority, dataTemplates[2].cost, dataTemplates[2].infCost],
        dividerLengths: [5, 7, 9, 0],
      },
      { data: [dataTemplates[2].args, dataTemplates[2].time], dividerLengths: [27, 0] },
      {
        data: [dataTemplates[3].name, dataTemplates[3].priority, dataTemplates[3].cost, dataTemplates[3].infCost],
        dividerLengths: [5, 7, 9, 0],
      },
      { data: [dataTemplates[3].args, dataTemplates[3].time], dividerLengths: [27, 0] },
      {
        data: [dataTemplates[4].name, dataTemplates[4].priority, dataTemplates[4].cost, dataTemplates[4].infCost],
        dividerLengths: [5, 7, 9, 0],
      },
      { data: [dataTemplates[4].args, dataTemplates[4].time], dividerLengths: [27, 0] },
      {
        data: [dataTemplates[5].name, dataTemplates[5].priority, dataTemplates[5].cost, dataTemplates[5].infCost],
        dividerLengths: [5, 7, 9, 0],
      },
      { data: [dataTemplates[5].args, dataTemplates[5].time], dividerLengths: [27, 0] },
    );

    // Run display.
    renderDashboard(
      ns,
      currentHost,
      headerTitle,
      maxDashboardWidth,
      renderQueue,
      characters,
      labelList,
      dataList,
      legend,
      colourList,
      priorityCountData,
      { cost: purchaseRequestQueueData.cost(0), infCost: purchaseRequestQueueData.infCost(0) },
    );

    // Refresh cycle.
    await ns.sleep(200);
    ns.clearLog();
  } // While loop ^.
}
