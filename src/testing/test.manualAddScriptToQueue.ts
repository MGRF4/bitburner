import { addScriptToQueue } from '@/infra/scriptQueue/utils';
import { NS } from '@ns';

export async function main(ns: NS) {
  ns.ui.openTail();
  ns.disableLog('ALL');
  ns.clearLog();

  await addScriptToQueue(ns, 1, 'testing/test.script.js', 'home', 100, 'y', 'y', ['testing", "apples", "arguments']);
}
