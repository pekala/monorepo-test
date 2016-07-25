#!/usr/bin/env node
'use strict';

const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const npmPackages = fs
    .readFileSync(__dirname + '/PACKAGES', 'utf8')
    .trim()
    .split('\n');

npmPackages.forEach(packageADir => {
    const packageADirPath = path.resolve(__dirname, '..', packageADir);
    const packageAJson = require(`${packageADirPath}/package.json`);
    const packageAName = packageAJson.name;
    const deps = packageAJson.dependencies || {};
    const devDeps = packageAJson.devDependencies || {};
    mkdirp(`${packageADirPath}/node_modules`);

    npmPackages.forEach(packageBDir => {
        const packageBDirPath = path.resolve(__dirname, '..', packageBDir);
        const packageBJson = require(`${packageBDirPath}/package.json`);
        const packageBName = packageBJson.name;
        if (packageBName in deps || packageBName in devDeps) {
            console.log(`Linking ${packageBDir} to ${packageADir}`)
            let linkOutput;
            try {

                linkOutput = execSync(`npm link ../${packageBDir}`, {
                    cwd: packageADirPath,
                    encoding: 'utf8',
                });
            } catch(e) {
                console.error(`Could not link ${packageBDir} to ${packageADir}: ${e}`);
                process.exit(1);
            }
        }
    });
});
