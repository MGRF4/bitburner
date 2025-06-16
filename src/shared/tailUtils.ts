import { initialisePorts } from '@/infra/portUtils';
import { NS } from '@ns';
import { verifyVitalFiles } from './validationUtils';

export async function initialiseTailWindow(ns: NS, title?: string) {
  ns.disableLog('ALL');
  ns.ui.openTail();
  if (title) ns.ui.setTailTitle(title);
  ns.ui.setTailFontSize(10);
  ns.clearLog();
  await initialisePorts(ns);
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
