import * as fs from 'fs-extra';
import { CmdLine } from '../interfaces/cmdline';
import { SettingsObject } from '../interfaces/setup';
import * as path from 'path';
import * as os from 'os';
import * as spawn from 'cross-spawn';
import *  as ejs from 'ejs';

const createAPI = (args: CmdLine, settings: SettingsObject): void => {
    fs.mkdirSync(args.projectName);
    const packageJson = {
        name: args.projectName,
        version: '0.1.0',
        private: true,
    };
    const originalDirectory = process.cwd();
    const root = path.resolve(args.projectName);
    fs.writeFileSync(
        path.join(root, 'package.json'),
        JSON.stringify(packageJson, null, 2) + os.EOL
    );

    const dependencies = calculateDependencies(settings);

    process.chdir(root);

    console.log('Installing packages. This might take a couple of minutes.');
    writePackageJson(root, settings.TypeScript as boolean).then(() => {
        installPackages(dependencies).then(() => {
            console.log('Done installing packages.');
        }).catch((err: Error) => {
            console.error(err);
        });
        
        copyTemplate(root, originalDirectory, settings).then(() => {
            console.log(`API backend created in ${root}`);
        }).catch((err: Error) => {
            console.error(err);
        });
    }).catch((err: Error) => {
        console.error(err);
    });
};

function calculateDependencies(settings: SettingsObject): string[] {
    const dependencies = ['mocha', 'chai'];
    if ('Backend' in settings) {
        dependencies.push(settings.Backend.toString().toLowerCase());
    }
    if ('Compression' in settings && settings.Compression) {
        dependencies.push('compression');
    }
    if ('CookieParser' in settings && settings.CookieParser) {
        dependencies.push('cookie-parser');
    }
    if ('CSRF' in settings && settings.CSRF) {
        dependencies.push('csurf');
    }
    if ('Logger' in settings && settings.Logger !== 'None') {
        dependencies.push(settings.Logger.toString().toLowerCase());
    }
    if ('BodyParser' in settings && settings.BodyParser && settings.Backend !== 'Express') {
        dependencies.push('body-parser');
    }
    if ('Backend' in settings && settings.Backend === 'Koa') {
        dependencies.push('koa-router');
    }
    if ('ORM' in settings && settings.ORM !== 'None') {
        dependencies.push(settings.ORM.toString().toLowerCase());
    }
    if ('Backend' in settings && settings.Backend !== 'Hapi') {
        dependencies.push('chai-http');
        dependencies.push('cors');
    }
    if ('TypeScript' in settings && settings.TypeScript) {
        dependencies.forEach(dep => {
            dependencies.push(`@types/${dep}`);
        });
        dependencies.push('@types/node');
        dependencies.push('tslint');
        dependencies.push('ts-node');
        dependencies.push('source-map-support');
    }
    
    dependencies.push('nyc');
    return dependencies;
}

function copyTemplate(appPath: string, originalDirectory: string, settings: SettingsObject): Promise<void> {
    return new Promise((resolve, reject) => {
        const templatePath = path.resolve(originalDirectory, 'src/templates', settings.TypeScript as boolean ? 'typescript' : 'javascript');
        if (fs.existsSync(templatePath)) {
            fs.copy(templatePath, appPath).then(() => {
                renderEJS(appPath, settings).then(() => {
                    resolve();
                }).catch((err: Error) => {
                    reject(err);
                });
                return;
            });
        } else {
            reject(`Could not locate supplied template: ${templatePath}`);
            return;
        }
    });
}

function renderEJS(appPath: string, settings: SettingsObject): Promise<void> {
    return new Promise((resolve, reject) => {
        const ejsFiles = listAllEjsFiles(appPath);
        ejsFiles.forEach((file) => {
            ejs.renderFile(file, settings, {}, (err, str) => {
                if (err) {
                    reject(err);
                } else {
                    fs.writeFileSync(
                        file.replace('.ejs', (settings.TypeScript as boolean ? '.ts':'.js')),
                        str
                    );
                    fs.remove(file);
                }
            });
        });
        resolve();
    });
}

function listAllEjsFiles(appPath: string): string[] {
    const ejsFiles: string[] = [];
    fs.readdirSync(appPath, { withFileTypes: true })
        .filter((file: fs.Dirent) => {
            return (file.name.indexOf('.') !== 0 && !file.name.includes('node_modules'));
        })
        .forEach((file) => {
            if (file.name.endsWith('.ejs')) {
                ejsFiles.push(path.resolve(appPath, file.name));
            }
            if (file.isDirectory()) {
                ejsFiles.push(...listAllEjsFiles(path.resolve(appPath, file.name)));
            }
        });
    return ejsFiles;
}

function writePackageJson(appPath: string, useTypeScript: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const appPackageJsonPath: string = path.join(appPath, 'package.json');
            const appPackageJson: {
                scripts: {},
                nyc?: {
                    include?: string[],
                    extension?: string[]
                    require?: string[]
                    reporter?: string[]
                    sourceMap?: boolean,
                    instrument?: boolean,
                }
            } = JSON.parse(fs.readFileSync(appPackageJsonPath).toString());

            if (useTypeScript) {
                appPackageJson.scripts = {
                    build: "npm run clean ; tsc -p .",
                    clean: "node scripts/clean-dist.js",
                    lint: "tslint --project .",
                    'lint:fix': "tslint --project . --fix",
                    start: "ts-node src/index.ts",
                };
            } else {
                appPackageJson.scripts = {
                    start: "node src/index.js",
                    lint: "eslint",
                    'lint:fix': "eslint --fix",
                };
            }

            appPackageJson.scripts = Object.assign(appPackageJson.scripts, {
                test: 'nyc mocha test/**/*.js test/*.js',
            });
            if (useTypeScript) {
                appPackageJson.scripts = Object.assign(appPackageJson.scripts, {
                    test: 'nyc mocha test/**/*.ts test/*.ts',
                });
                appPackageJson.nyc = {
                    include: [
                        'src/**/*.ts',
                        'src/*.ts',
                    ],
                    extension: [
                        '.ts',
                    ],
                    require: [
                        'ts-node/register',
                    ],
                    reporter: [
                        'text-summary',
                        'html',
                    ],
                    sourceMap: true,
                    instrument: true,
                };
            }
            return fs.writeFile(
                path.join(appPath, 'package.json'),
                JSON.stringify(appPackageJson, null, 2) + os.EOL
            ).then(() => {
                resolve();
                return;
            }).catch((err) => {
                reject(err);
                return;
            });
        } catch (err) {
            reject(err);
            return;
        }
    });
}

function installPackages(packages: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const npmExec = 'npm';
        const npmArgs = [
            'install',
            '--save',
            '--save-exact',
            '--loglevel',
            'error',
        ].concat(packages);
        const child = spawn(npmExec, npmArgs, { stdio: 'inherit' });
        child.on('close', (code: number) => {
            if (code !== 0) {
                reject({
                    command: `${npmExec} ${npmArgs.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });
}

export { createAPI };