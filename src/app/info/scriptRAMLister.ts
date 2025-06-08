import { NS } from '@ns';

export async function main(ns: NS) {
  ns.ui.openTail();
  ns.disableLog('ALL');
  ns.clearLog();

  const scriptRamListFile = '/data/script-ram-list.txt';
  if (ns.fileExists(scriptRamListFile)) {
    ns.rm(scriptRamListFile);
  }

  const homeScripts = ns.ls('home').filter((s) => s.endsWith('.js') || s.endsWith('.ns') || s.endsWith('.ts'));
  const formattedLines: string[] = [];

  const reset = '\u001b[0m';
  const scriptColor = '\u001b[38;5;45m'; // cyan
  const ramColor = '\u001b[38;5;214m'; // orange

  for (const script of homeScripts) {
    const scriptRam = ns.getScriptRam(script);
    const formattedLine = `${scriptColor}${script}${reset} ${ramColor}${scriptRam}GB${reset}`;
    formattedLines.push(formattedLine);
  }

  const outputData = formattedLines.join('\n');
  ns.write(scriptRamListFile, outputData, 'w');

  ns.print(outputData);
  ns.print(`${ramColor}✔ Saved script RAM list to ${scriptRamListFile}${reset}`);
}
