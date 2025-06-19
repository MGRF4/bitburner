import { initialisePorts } from '@/infra/portUtils';
import { NS } from '@ns';
import { verifyVitalFiles } from './validationUtils';
import { applyFreeRamPercentage } from './ramUtils';

export async function initialiseTailWindow(ns: NS, title?: string) {
  ns.disableLog('ALL');
  ns.ui.openTail();
  if (title) ns.ui.setTailTitle(title);
  ns.ui.setTailFontSize(10);
  ns.clearLog();
  await initialisePorts(ns);
}

function checkNextPhase(ns: NS, script: string) {
  const ram = ns.getScriptRam(script, 'home');
  if (ns.getServerMaxRam('home') < ram) return ns.print('ERROR RAM FAILURE');
}

export async function phaseCompletionSequence(ns: NS, string: string, waitInMilliseconds: number, nextScript: string) {
  ns.print('SUCCESS ' + string.toString());
  ns.ui.renderTail();
  await ns.sleep(waitInMilliseconds);
  checkNextPhase(ns, nextScript);
  ns.ui.closeTail();
  ns.spawn(nextScript, { threads: 1, spawnDelay: 0 });
}

export function repositionWindow(ns: NS, xPos: number, yPos: number) {
  ns.ui.moveTail(xPos, yPos);
}

export function resizeWindow(ns: NS, maxCharacterWidthSize: number, heightInPixels: number) {
  const pixelsPerChar = 6.035;

  const width = Math.ceil(maxCharacterWidthSize * pixelsPerChar);

  ns.ui.resizeTail(width, heightInPixels);
}

export function getActualLineHeight(): number {
  const span = document.createElement('span');
  span.style.fontFamily = 'JetBrainsMono, Courier New, monospace';
  span.style.fontSize = '10px';
  span.style.lineHeight = '1.5';
  span.style.visibility = 'hidden';
  span.style.whiteSpace = 'pre';
  span.textContent = 'A\nB'; // Two lines

  document.body.appendChild(span);
  const height = span.offsetHeight / 2; // average line height
  document.body.removeChild(span);
  return height;
}

export function simpleUpdateTail(ns: NS, printString: string) {
  //ns.clearLog();
  ns.print(printString);
  ns.print(' ');
}
