import { NS } from '@ns';
import { safeReadServerFile } from './targetServerRecordingUtils';
import { fileExists } from '@/shared/validationUtils';

export function assignTargetServersToPurchaseServers(ns: NS, serverList: string[]) {
  const fileName = '/data/purchasedServer/assignedPurchasedServers.txt';
  const pServName = 'pServer-';

  const assignedPurchasedServerList = [];

  for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
    const subList = [];
    subList.push(pServName + i);

    for (let j = 0; j < 4; j++) {
      const selected = serverList[i + j * ns.getPurchasedServerLimit()];
      if (selected) {
        subList.push(selected);
      }
    }
    assignedPurchasedServerList.push(subList);
  }
  ns.write(fileName, JSON.stringify(assignedPurchasedServerList), 'w');
}

export async function getInitialTargetForBatching(ns: NS, serverList: string[]) {
  let bestTarget = '';
  let bestValue = 0;

  for (const server of serverList) {
    const fileHeader = '/data/serverData/';
    if (fileExists(ns, fileHeader + server + '.txt', 'home')) {
      const data = await safeReadServerFile(ns, server);
      const d = data[0];
      const value = d.moneyTaken / (d.weakenTime * getServerCost(ns, d.serverRamNeeded));
      ns.print(server + ' ' + value);
      if (value > bestValue) {
        bestValue = value;
        bestTarget = server;
      }
    }
  }
  return bestTarget;
}

function getServerCost(ns: NS, ram: number) {
  return ns.getPurchasedServerCost(ram);
}
