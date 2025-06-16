import { readColourPalette } from '@/shared/colourUtils';
import {
  renderDashboardHeaderLine,
  renderDataLine,
  renderEndLine,
  renderLabelLine,
  renderSpacerLine,
} from '@/shared/gui/dashboard/dashboardLines';
import { mergeColourList, mergeCharacters } from '@/shared/gui/dashboard/functions';
import {
  getOptimisedServerList,
  getOptimalHackingServer,
  attemptRootAccess,
  copyFilesToServer,
  decideHackGrowOrWeaken,
} from '@/shared/hackUtils';
import { formatNumberTemplate, formatStringTemplate } from '@/shared/stringUtils';
import { initialiseTailWindow } from '@/shared/tailUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  await initialiseTailWindow(ns, 'earlyHack');
  //ns.ui.openTail();

  let pid = ns.run('/app/scanNetwork.js');
  while (ns.isRunning(pid)) await ns.sleep(10);

  const scripts = ['/domain/hacking/weakenServer.js', '/domain/hacking/growServer.js', 'domain/hacking/hackServer.js'];

  // Main loop.
  while (true) {
    await ns.sleep(100);
    ns.clearLog();

    const serverList = await getOptimisedServerList(ns);
    const optimalServer = getOptimalHackingServer(ns, serverList);
    if (!optimalServer) continue;
    const operation = decideHackGrowOrWeaken(ns, optimalServer);

    let wait = 0;

    for (const server of serverList) {
      attemptRootAccess(ns, server);
      if (!ns.hasRootAccess(server)) continue;
      copyFilesToServer(ns, server, scripts);
      const serverRamAvailable = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
      let threads;
      switch (operation) {
        case 'weaken':
          const weakenRam = ns.getScriptRam(scripts[0]);
          threads = Math.floor(serverRamAvailable / weakenRam);
          if (threads > 0) {
            pid = ns.exec(scripts[0], server, threads, optimalServer);
            if (pid > 0) wait = ns.getWeakenTime(optimalServer);
          }
          break;

        case 'grow':
          const growRam = ns.getScriptRam(scripts[1]);
          threads = Math.floor(serverRamAvailable / growRam);
          if (threads > 0) {
            pid = ns.exec(scripts[1], server, threads, optimalServer);
            if (pid > 0) wait = ns.getGrowTime(optimalServer);
          }
          break;

        case 'hack':
          break;
          const hackRam = ns.getScriptRam(scripts[2]);
          threads = Math.floor(serverRamAvailable / hackRam);
          if (threads > 0) {
            pid = ns.exec(scripts[2], server, threads, optimalServer);
            if (pid > 0) wait = ns.getHackTime(optimalServer);
          }
          break;
      }
    }
    // Display.
    let colourList = mergeColourList(...readColourPalette(ns));
    const characters = mergeCharacters('╭', '╮', '╰', '╯', '─', '│', '┤', '├', '╌', ' ');
    ns.print(renderDashboardHeaderLine(ns, 40, optimalServer, 25, characters, colourList));
    ns.print(renderSpacerLine(ns, 40, characters, colourList, 'y'));
    ns.print(
      renderLabelLine(
        ns,
        40,
        characters,
        { labels: ['Security:  Minimum / Current | %'], dividerLengths: [0] },
        colourList,
      ),
    );
    ns.print(
      renderDataLine(
        ns,
        40,
        25,
        characters,
        {
          data: [
            formatNumberTemplate(ns, 7, 'l', ns.getServerMinSecurityLevel(optimalServer), 'none'),
            formatNumberTemplate(ns, 7, 'r', ns.getServerSecurityLevel(optimalServer), 'none'),
            formatNumberTemplate(
              ns,
              7,
              'r',
              ns.getServerSecurityLevel(optimalServer) / ns.getServerMinSecurityLevel(optimalServer),
              'percent',
            ),
          ],
          dividerLengths: [4, 7, 0],
        },
        colourList,
        colourList.criticalColour,
      ),
    );
    ns.print(renderSpacerLine(ns, 40, characters, colourList, 'y'));
    ns.print(
      renderLabelLine(ns, 40, characters, { labels: ['Money:  Current / Max'], dividerLengths: [0] }, colourList),
    );
    ns.print(
      renderDataLine(
        ns,
        40,
        7,
        characters,
        {
          data: [
            formatNumberTemplate(ns, 10, 'l', ns.getServerMoneyAvailable(optimalServer), 'money'),
            formatNumberTemplate(ns, 10, 'r', ns.getServerMaxMoney(optimalServer), 'money'),
          ],
          dividerLengths: [12, 0],
        },
        colourList,
        colourList.criticalColour,
      ),
    );
    ns.print(renderSpacerLine(ns, 40, characters, colourList, 'y'));
    ns.print(renderLabelLine(ns, 40, characters, { labels: ['Operation'], dividerLengths: [0] }, colourList));
    ns.print(
      renderDataLine(
        ns,
        40,
        25,
        characters,
        { data: [formatStringTemplate(25, 'l', operation)], dividerLengths: [0] },
        colourList,
        colourList.criticalColour,
      ),
    );
    ns.print(renderSpacerLine(ns, 40, characters, colourList, 'y'));
    ns.print(renderEndLine(ns, 40, characters, colourList));
    // Sleep.
    await ns.sleep(wait);
  }
}
