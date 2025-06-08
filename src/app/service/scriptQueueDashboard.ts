import { createLastScriptRanInfo, createScriptQueueInfo } from '@/infra/scriptQueue/modelUtils';
import { readColourPalette } from '@/shared/colourUtils';
import { renderDashboard } from '@/shared/gui/dashboard/dashboardBuilder';
import {
  mergeRenderQueue,
  mergeLabelList,
  mergeColourList,
  mergeCharacters,
  mergeDataList,
} from '@/shared/gui/dashboard/functions';
import { getScriptRam } from '@/shared/ramUtils';
import {
  formatStringTemplate,
  formatNumberTemplate,
  colourNumbersAndLetters,
  formatYesNoTemplate,
  formatArgumentsTemplate,
} from '@/shared/stringUtils';
import { initialiseTailWindow, resizeWindow } from '@/shared/tailUtils';
import { getCurrentTimeInSeconds, formatTimeFromSecondsWithColour } from '@/shared/timeUtils';
import { serverExists, fileExists } from '@/shared/validationUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  await initialiseTailWindow(ns, ' ');

  // Declare variables.
  const maxDashboardWidth = 80;
  const stringLength = 30;
  const headerTitle = 'Script Queue';
  const legend = 'Pri: priority   SpT: splitThreads   Iso: isolate';
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
    'ramGaugeLine',
    'ramUsageLine',
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
    {
      labels: ['Last Script Executed', 'Pri', 'Threads', 'RAM', 'SpT', 'Iso'],
      dividerLengths: [17, 1, 3, 1, 1, 0],
    },
    { labels: ['Arguments', 'Time in Queue'], dividerLengths: [48, 0] },
    { labels: ['Priority Count'], dividerLengths: [0] },
    {
      labels: ['Next Script in Queue', 'Pri', 'Threads', 'RAM', 'SpT', 'Iso'],
      dividerLengths: [17, 1, 3, 1, 1, 0],
    },
    { labels: ['Arguments', 'Time in Queue'], dividerLengths: [48, 0] },
  );

  // Resize tail window.
  resizeWindow(ns, maxDashboardWidth, 650);
  // Start loop.
  while (true) {
    let colourList = mergeColourList(...readColourPalette(ns));
    //colourList.dataColour = ;
    const characters = mergeCharacters('╭', '╮', '╰', '╯', '─', '│', '┤', '├', '╌', ' ');

    // Get data for last script ran.
    const lastScriptData = await createLastScriptRanInfo(ns);
    const lastScriptName = lastScriptData.script();
    const lastScriptPriority = lastScriptData.priority();
    const lastScriptThreads = lastScriptData.threads();
    const lastScriptRam = lastScriptData.ram();
    const lastScriptSplitThreads = lastScriptData.splitThreads();
    const lastScriptIsolate = lastScriptData.isolate();
    const lastScriptArguments = lastScriptData.arguments();
    const lastScriptTimeTaken = lastScriptData.timeTaken();

    // Get data for script queue.
    const scriptQueueData = await createScriptQueueInfo(ns);
    const dataEntries = [];
    for (let i = 0; i < 6; i++) {
      const [priority, name, host, threads, splitThreads, isolate, args, time] = scriptQueueData.entry(i);
      const ram = getScriptRam(ns, name, host);
      const newTime = getCurrentTimeInSeconds() - time;
      dataEntries.push({ priority, name, host, threads, ram, splitThreads, isolate, args, newTime });
    }

    // Get data for priority counts.
    const priorityCountData = scriptQueueData.priorityCount();

    // Get last script ran templates.
    const lastScriptNameTemp = formatStringTemplate(stringLength, 'l', lastScriptName);
    let lastScriptPriorityTemp = formatNumberTemplate(ns, 1, 'l', lastScriptPriority, 'none');
    const lastScriptThreadsTemp = colourNumbersAndLetters(
      ns,
      formatNumberTemplate(ns, 7, 'r', lastScriptThreads, 'threads'),
      colourList,
    );
    const lastScriptRamTemp = colourNumbersAndLetters(
      ns,
      formatNumberTemplate(ns, 7, 'r', lastScriptRam, 'ram'),
      colourList,
    );
    const lastScriptSplitThreadsTemp = formatYesNoTemplate(1, lastScriptSplitThreads);
    const lastScriptIsolateTemp = formatYesNoTemplate(1, lastScriptIsolate);
    const lastScriptArgumentsTemp = formatArgumentsTemplate(ns, stringLength, 'l', lastScriptArguments, colourList);
    const lastScriptTimeTakenTemp = formatTimeFromSecondsWithColour(
      ns,
      15,
      lastScriptTimeTaken,
      colourList.criticalColour,
      colourList.shadowColour,
      colourList.criticalColour,
      'r',
    );
    if (lastScriptNameTemp == ' '.repeat(stringLength)) {
      lastScriptPriorityTemp = ' ';
    }

    // Get queued script/s templates.
    const dataTemplates: any[] = [];
    for (let i = 0; i < 6; i++) {
      const data = dataEntries[i];
      const name = formatStringTemplate(stringLength, 'l', data.name);
      let priority = formatNumberTemplate(ns, 1, 'l', data.priority, 'none');
      const threads = colourNumbersAndLetters(
        ns,
        formatNumberTemplate(ns, 7, 'r', data.threads, 'threads'),
        colourList,
      );
      const ram = colourNumbersAndLetters(ns, formatNumberTemplate(ns, 7, 'r', data.ram, 'ram'), colourList);
      let splitThreads = formatYesNoTemplate(1, data.splitThreads);
      let isolate = formatYesNoTemplate(1, data.isolate);
      const args = formatArgumentsTemplate(ns, stringLength, 'l', data.args, colourList);
      let time = formatTimeFromSecondsWithColour(
        ns,
        15,
        data.newTime,
        colourList.criticalColour,
        colourList.shadowColour,
        colourList.criticalColour,
        'r',
      );
      if (!serverExists(ns, data.host) || !fileExists(ns, data.name, data.host)) {
        priority = ' ';
        splitThreads = ' ';
        isolate = ' ';
        time = ' ';
      }
      dataTemplates.push({ name, priority, threads, ram, splitThreads, isolate, args, time });
    }

    // Construct data lines from templates.
    const dataList = mergeDataList(
      {
        data: [
          lastScriptNameTemp,
          lastScriptPriorityTemp,
          lastScriptThreadsTemp,
          lastScriptRamTemp,
          lastScriptSplitThreadsTemp,
          lastScriptIsolateTemp,
        ],
        dividerLengths: [10, 4, 1, 4, 5, 0],
      },
      { data: [lastScriptArgumentsTemp, lastScriptTimeTakenTemp], dividerLengths: [27, 0] },
      {
        data: [
          dataTemplates[0].name,
          dataTemplates[0].priority,
          dataTemplates[0].threads,
          dataTemplates[0].ram,
          dataTemplates[0].splitThreads,
          dataTemplates[0].isolate,
        ],
        dividerLengths: [10, 4, 1, 4, 5, 0],
      },
      { data: [dataTemplates[0].args, dataTemplates[0].time], dividerLengths: [27, 0] },
      {
        data: [
          dataTemplates[1].name,
          dataTemplates[1].priority,
          dataTemplates[1].threads,
          dataTemplates[1].ram,
          dataTemplates[1].splitThreads,
          dataTemplates[1].isolate,
        ],
        dividerLengths: [10, 4, 1, 4, 5, 0],
      },
      { data: [dataTemplates[1].args, dataTemplates[1].time], dividerLengths: [27, 0] },
      {
        data: [
          dataTemplates[2].name,
          dataTemplates[2].priority,
          dataTemplates[2].threads,
          dataTemplates[2].ram,
          dataTemplates[2].splitThreads,
          dataTemplates[2].isolate,
        ],
        dividerLengths: [10, 4, 1, 4, 5, 0],
      },
      { data: [dataTemplates[2].args, dataTemplates[2].time], dividerLengths: [27, 0] },
      {
        data: [
          dataTemplates[3].name,
          dataTemplates[3].priority,
          dataTemplates[3].threads,
          dataTemplates[3].ram,
          dataTemplates[3].splitThreads,
          dataTemplates[3].isolate,
        ],
        dividerLengths: [10, 4, 1, 4, 5, 0],
      },
      { data: [dataTemplates[3].args, dataTemplates[3].time], dividerLengths: [27, 0] },
      {
        data: [
          dataTemplates[4].name,
          dataTemplates[4].priority,
          dataTemplates[4].threads,
          dataTemplates[4].ram,
          dataTemplates[4].splitThreads,
          dataTemplates[4].isolate,
        ],
        dividerLengths: [10, 4, 1, 4, 5, 0],
      },
      { data: [dataTemplates[4].args, dataTemplates[4].time], dividerLengths: [27, 0] },
      {
        data: [
          dataTemplates[5].name,
          dataTemplates[5].priority,
          dataTemplates[5].threads,
          dataTemplates[5].ram,
          dataTemplates[5].splitThreads,
          dataTemplates[5].isolate,
        ],
        dividerLengths: [10, 4, 1, 4, 5, 0],
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
    );

    // Refresh cycle.
    await ns.sleep(200);
    ns.clearLog();
  } // While loop ^.
}
