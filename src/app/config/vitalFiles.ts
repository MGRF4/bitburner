/*
    Wizard.Config.ts

    This program will prompt the user to input;
        - Max Hack% Amount that will be taken from a target each cycle.
        - Hack% incremement Amount, amount to incremement the Hack% by.
        - The time allocated to the minimal time for a HGW cycle to finish.
        - The percentage of RAM that should be left free on a Server.

    The program will first prompt the user if they would like to change these values.
    Then it will prompt for the new values.
*/

import { NS } from '@ns';

export async function main(ns: NS) {
  //ns.ui.openTail();
  ns.disableLog('ALL');
  ns.clearLog();

  const storageFolder = '/data/';
  let file: string;
  let checkMessage: string;

  const checkInteraction = {
    type: 'select' as const,
    choices: ['Yes', 'No'],
  };

  let message: string;
  let interaction: { type: 'select'; choices: string[] };

  for (let i = 0; i < 4; i++) {
    switch (i) {
      case 0: // Max Hack% Amount
        file = storageFolder + 'MaxHack%Amount.txt';
        checkMessage = '| Max Hack% Amount |';
        message = 'What would you like the value of ' + checkMessage + ' to be?';
        interaction = { type: 'select', choices: ['30%', '40%', '50%', '60%', '70%', '80%'] };
        break;
      case 1: // Hack% Increment
        file = storageFolder + 'Hack%Increment.txt';
        checkMessage = '| Hack% Increment Amount |';
        message = 'What would you like the value of ' + checkMessage + ' to be?';
        interaction = { type: 'select', choices: ['0.001%', '0.01%', '0.05%', '0.1%', '0.2%'] };
        break;
      case 2: // Free RAM%
        file = storageFolder + 'FreeRAM%.txt';
        checkMessage = '| Free RAM% Amount |';
        message = 'What would you like the value of ' + checkMessage + ' to be?';
        interaction = { type: 'select', choices: ['5%', '10%', '15%', '20%', '30%'] };
        break;
      case 3: // Cycle Sync Finish Window
        file = storageFolder + 'CycleSyncTimeWindow.txt';
        checkMessage = '| Cycle Sync Window |';
        message = 'What would you like the value of ' + checkMessage + ' to be?';
        interaction = { type: 'select', choices: ['1 Seconds', '2 Seconds', '3 Seconds', '4 Seconds'] };
        break;
      default:
        ns.print("ERROR 'i' in for loop, outside of switch bounds.");
        ns.exit();
    }

    // Check if the user wants to change the value
    const checkResult = await ns.prompt('Would you like to change ' + checkMessage + '?', checkInteraction);

    if ((typeof checkResult === 'string' && checkResult === 'Yes') || !ns.fileExists(file)) {
      const dataResult = await ns.prompt(message, interaction);

      if (typeof dataResult === 'string') {
        let data = dataResult;

        if (data.endsWith('%')) {
          data = data.slice(0, -1);
        } else if (data.endsWith('Seconds')) {
          data = data.split(' ')[0];
        }

        ns.print(`${checkMessage} updated to ${data}`);
        ns.write(file, data, 'w');
      } else {
        ns.print(`Unexpected response type: ${typeof dataResult}`);
      }
    }
  }
}
