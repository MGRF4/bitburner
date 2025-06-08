import { purchaseRequestAlreadyExists } from '@/infra/arrayUtils';
import { executeNextScriptInQueue } from '@/infra/scriptQueue/utils';
import { purchaseRequest_home } from '@/shared/purchaseRequestUtils';
import { applyFreeRamPercentage } from '@/shared/ramUtils';
import { colourNumbersAndLetters } from '@/shared/stringUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  while (true) {
    await executeNextScriptInQueue(ns);

    const host = ns.getServer().hostname;
    ns.print(host);
    const usedRam = ns.getServerUsedRam(host);
    const maxRam = ns.getServerMaxRam(host);

    if (usedRam > applyFreeRamPercentage(ns, maxRam)) {
      await purchaseRequest_home(ns, 'RAM');
    }

    await ns.sleep(1000);
    ns.clearLog();
  }
}
