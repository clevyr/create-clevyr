
import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import path from 'path';

import { ArgumentParser } from 'argparse';
import allSettings from '../data/settings';
import createAPI from './createAPI';

const version = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'))).version;

const parser = new ArgumentParser({
    version: version,
    addHelp: true,
    description: 'Creates an API backend',
});

parser.addArgument(['projectName'], { help: 'The name of the project to make' });

const args = parser.parseArgs();

const main = async () => {
    /* const currentSettings: SettingsObject = packageJson.clevyrgenerator;

  if (currentSettings) {
    // Default to current settings if set
    for (const key of Object.keys(currentSettings)) {
      allSettings.forEach((setting: Setting, index: number): void => {
        if (setting.name === key) {
          allSettings[index].default = currentSettings[key];
          return;
        }
      });
    }
  }
  */

    const promptResult = await inquirer.prompt(allSettings);
    createAPI(args, promptResult);
};

main();
