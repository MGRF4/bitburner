import {
  recordServerHGWCalculationsUsingFormulas,
  safeReadServerFile,
} from '@/domain/hacking/targetServerRecordingUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  ns.ui.openTail();
  ns.disableLog('ALL');
  // ns.clearLog();
  ns.ui.setTailFontSize(12);

  ns.nuke('sigma-cosmetics');

  // Start.
  ns.clearLog();
  ns.print(' ');
  ns.print(ns.getServerMaxMoney('sigma-cosmetics'));
  await recordServerHGWCalculationsUsingFormulas(ns, ['sigma-cosmetics']);
  //ns.exit();
  const temp = await safeReadServerFile(ns, 'foodnstuff');

  ns.print(temp);

  ns.print(' ');

  ns.print(ns.getServer('sigma-cosmetics').moneyAvailable);
  ns.clearLog();
  for (let i = 0; i < 24; i++) {
    ns.print(' ');
    ns.print(i + '||||||||||');
  }
  ns.print(' ');

  //ns.exit();
  /*
  while (
    ns.getServerSecurityLevel('foodnstuff') > ns.getServerMinSecurityLevel('foodnstuff') ||
    ns.getServerMoneyAvailable('foodnstuff') < ns.getServerMaxMoney('foodnstuff')
  ) {
    ns.print(' ');
    ns.print('SEC: ' + ns.getServerMinSecurityLevel('foodnstuff') + ' / ' + ns.getServerSecurityLevel('foodnstuff'));
    ns.print('MON: ' + ns.getServerMoneyAvailable('foodnstuff') + ' / ' + ns.getServerMaxMoney('foodnstuff'));
    ns.print('Wtime: ' + ns.getWeakenTime('foodnstuff'));
    ns.print(' ');
    const ram = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
    const wThreads = Math.floor(ram / ns.getScriptRam('/domain/hacking/weakenServer.js'));
    const gThreads = Math.floor(ram / ns.getScriptRam('/domain/hacking/growServer.js'));
    if (ns.getServerSecurityLevel('foodnstuff') > ns.getServerMinSecurityLevel('foodnstuff') && wThreads > 0) {
      ns.run('/domain/hacking/weakenServer.js', wThreads, 'foodnstuff');
      ns.print('weaken');
      await ns.sleep(ns.getWeakenTime('foodnstuff') + 1);
    } else if (ns.getServerMoneyAvailable('foodnstuff') < ns.getServerMaxMoney('foodnstuff') && gThreads > 0) {
      ns.run('/domain/hacking/growServer.js', gThreads, 'foodnstuff');
      ns.print('grow');
      await ns.sleep(ns.getGrowTime('foodnstuff') + 1);
    }
  }
    */
}
