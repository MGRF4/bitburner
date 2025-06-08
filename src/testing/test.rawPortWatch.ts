import { readPortSafely } from '@/infra/portUtils';
import { initialiseTailWindow } from '@/shared/tailUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  await initialiseTailWindow(ns);

  while (true) {
    const port1 = await readPortSafely(ns, 1);
    const port2 = await readPortSafely(ns, 2);
    const port3 = await readPortSafely(ns, 3);
    const port4 = await readPortSafely(ns, 4);

    ns.print('port1: ' + JSON.stringify(port1));
    ns.print(' ');
    ns.print('port2: ' + JSON.stringify(port2));
    ns.print(' ');
    ns.print('port3: ' + JSON.stringify(port3));
    ns.print(' ');
    ns.print('port4: ' + JSON.stringify(port4));

    await ns.sleep(1000);
    ns.clearLog();
  }
}
