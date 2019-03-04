
import {readFileSync, writeFileSync} from 'fs';
import * as inquirer from 'inquirer';
import * as path from 'path';

const ArgumentParser = require('argparse').ArgumentParser;
import {allSettings} from '../data/settings';
import {SettingsObject} from '../interfaces/setup';
import {CmdLine} from '../interfaces/cmdline';
import {createAPI} from './createAPI';

const PACKAGE_JSON_FILE: string = path.join(__dirname, '../../package.json');
const packageJson: {clevyrgenerator: SettingsObject, version: string} = JSON.parse(readFileSync(PACKAGE_JSON_FILE).toString());

const parser = new ArgumentParser({
  version: packageJson.version,
  addHelp: true,
  description: 'Creates an API backend',
});

parser.addArgument([ 'projectName' ], { help: 'The name of the project to make' });

const args: CmdLine = parser.parseArgs();

const main = async () => {
  /*const currentSettings: SettingsObject = packageJson.clevyrgenerator;

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

  const promptResult: SettingsObject = await inquirer.prompt(allSettings);
  createAPI(args, promptResult);
};

main();