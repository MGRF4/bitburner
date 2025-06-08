/*
    Scanner.Networks.ts
    This program will build a list of all servers in the network.
    It will then sort the list into each servers individual Required Hack level.
    It will then remove the servers that have no money on them.
*/

import { NS } from '@ns';

export async function main(ns: NS) {
  //ns.ui.openTail();
  ns.disableLog('ALL');
  ns.clearLog();

  let serverList;
  let newScan;
  let serverListRam;
  let serverListByHackLevel;
  let serverListByHackLevelMaxMoney;

  // Populate the list initially.
  serverList = ns.scan('home');
  for (let i = 0; i < serverList.length; i++) {
    // Make a new list by scanning the defined server in the original list.
    newScan = ns.scan(serverList[i]);
    // If the server in the new list is not already present in the original list,
    // then add it to the original list.
    for (let j = 0; j < newScan.length; j++) {
      if (!serverList.includes(newScan[j])) {
        serverList.push(newScan[j]);
      }
    }
  }
  // Remove home from the list.
  serverList.splice(serverList.indexOf('home'), 1);
  // Write the original server list to file.
  ns.write('/SystemDataStorage/RawNativeServerList.txt', serverList.toString(), 'w');

  // Delete servers that dont have RAM, are hacknet or purchased servers.
  serverListRam = serverList.filter((server) => ns.getServerMaxRam(server) > 0);
  serverListRam.filter((item) => !item.includes('hacknet'));
  //serverListRam = serverListRam.filter((item) => !item.includes('pServ'));
  ns.write('/SystemDataStorage/HaveRamServerList.txt', serverListRam.toString(), 'w');

  // Order the original server list by their respective Hack level requirements.
  serverListByHackLevel = serverList.sort(
    (a, b) => ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b),
  );
  // Write the list to a new file.
  ns.write('/SystemDataStorage/HackLevelServerList.txt', serverListByHackLevel.toString(), 'w');

  // Optimize list by removing any servers that have no max money.
  serverListByHackLevelMaxMoney = serverListByHackLevel.filter((server) => ns.getServerMaxMoney(server) > 0);
  // Write new list to a new file.
  ns.write('/SystemDataStorage/ServerListByH&M.txt', serverListByHackLevelMaxMoney.toString(), 'w');
}
