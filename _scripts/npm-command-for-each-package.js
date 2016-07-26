#!/usr/bin/env node
'use strict';

const path = require('path');
const execSync = require('child_process').execSync;
const findPackages = require('./find-packages');

const npmPackages = findPackages();
const cliArgs = process.argv.slice(2).join(' ');

npmPackages.forEach(pkg => {
    try {
        console.log(`> Running "npm ${cliArgs}" from ${pkg}`)
        execSync(`npm ${cliArgs}`, {
            cwd: path.resolve(__dirname, '..', pkg),
            encoding: 'utf8',
        });
    } catch(error) {
        console.error(`Could not execute "npm ${cliArgs}" for the packages ${pkg}: ${error}`);
        process.exit(error.status);
    }
});
