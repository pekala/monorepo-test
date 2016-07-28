#!/usr/bin/env node
'use strict';

const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const compareSemver = require('semver-compare');
const findPackages = require('./find-packages');

const npmPackages = findPackages();

function testLinked(dir) {

    return true;
}

function updateDependencyInPackage(dependency, version, pkgDir) {
    const dirPath = path.resolve(__dirname, '..', pkgDir);
    const pkgJsonPath = `${dirPath}/package.json`;
    const pkgJson = require(pkgJsonPath);
    const deps = pkgJson.dependencies || {};
    const devDeps = pkgJson.devDependencies || {};
    const hasDep = dependency in deps && compareSemver(version, deps[dependency]) === 1;
    const hasDevDep = dependency in devDeps && compareSemver(version, devDeps[dependency]) === 1;

    if (hasDep || hasDevDep) {
        try {
            execSync(`npm test`, {
                cwd: dirPath,
                encoding: 'utf8',
            });
        } catch(error) {
            console.error(`Tests while trying to update ${dependency} to version ${version} in ${pkgJson.name}: \n ${error.stdout}`);
            process.exit(error.status);
        }
    } else {
        return;
    }

    if (hasDep) {
        const currentVersion = deps[dependency];
        console.log('dep', dependency, version, currentVersion);
        pkgJson.dependencies[dependency] = version;
    }

    if (hasDevDep) {
        const currentVersion = deps[dependency];
        console.log('devdep', dependency, version, currentVersion)
        pkgJson.devDependencies[dependency] = version;
    }

    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    console.log(`Updated ${dependency} to version ${version} in ${pkgJson.name}`);
}

npmPackages.forEach(packageADir => {
    const packageADirPath = path.resolve(__dirname, '..', packageADir);
    const packageAJson = require(`${packageADirPath}/package.json`);
    const packageAName = packageAJson.name;
    const packageAVersion = packageAJson.version;
    npmPackages.forEach(pkgBDir =>
        updateDependencyInPackage(packageAName, packageAVersion, pkgBDir));
});
