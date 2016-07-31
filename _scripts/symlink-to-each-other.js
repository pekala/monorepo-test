#!/usr/bin/env node
'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const findPackages = require('./find-packages');

Promise.resolve()
    .then(() => findPackages())
    .then(packages => packages.reduce(
        (promise, pkg) => promise.then(() => linkPackage(pkg, packages)),
        Promise.resolve()
    ))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


function linkPackage(pkg, packages) {
    const packageADirPath = path.resolve(__dirname, '..', pkg.name);
    const packageAJson = require(`${packageADirPath}/package.json`);
    const deps = packageAJson.dependencies || {};
    const devDeps = packageAJson.devDependencies || {};

    const dependencies = packages
        .filter(pkgB => pkgB.name !== pkg.name)
        .map(pkgB => {
            const packageBDirPath = path.resolve(__dirname, '..', pkgB.name);
            const packageBJson = require(`${packageBDirPath}/package.json`);
            if (pkgB.npmName in deps || pkgB.npmName in devDeps) {
                return pkgB;
            } else {
                return null;
            }
        })
        .filter(pkgB => pkgB);

    if (!dependencies.length) {
        return Promise.resolve();
    }

    const dirsToDelete = dependencies.map(pkg => `node_modules/${pkg.npmName}`).join(' ');
    const pkgsToLink = dependencies.map(pkg => `../${pkg.name}`).join(' ');

    return new Promise((resolve, reject) => {
        exec(`rm -rf ${dirsToDelete} && npm link ${pkgsToLink}`, {
            cwd: path.resolve(__dirname, '..', pkg.name),
            encoding: 'utf8',
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Could not link ${pkgsToLink} in ${pkg.name}: ${error} \n ${stderr}`);
                reject(error.status);
                return;
            }
            console.log(`Linked ${pkgsToLink} to ${pkg.name}`);
            resolve();
        });
    });
}
