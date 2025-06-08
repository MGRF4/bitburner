import { initialiseTailWindow } from '@/shared/tailUtils';
import { NS } from '@ns';

export async function main(ns: NS) {
  const storageFolder = '/SystemDataStorage/';
  const file = 'ColourPalette.txt';

  const labels = ['Title', 'Border', 'Label', 'Data', 'Critical', 'Shadow'];
  const palette: number[] = [];

  for (const label of labels) {
    let result: number | undefined;

    while (result === undefined || isNaN(result) || result < 0 || result > 255) {
      const input = await ns.prompt(`What colour would you like ${label} to be? (0 - 255)`, {
        type: 'text',
      });

      result = Number(input);
    }

    palette.push(result);
  }

  ns.write(storageFolder + file, palette.toString(), 'w');
}
