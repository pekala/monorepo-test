#!/usr/bin/env node
'use strict';

const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const compareSemver = require('semver-compare');

function testPackage(pkg) {
    new Promise((resolve, reject) => {
        exec('npm test', {
            cwd: path.resolve(__dirname, '..', pkgB.name),
            encoding: 'utf8',
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Could not commit and push release changes for ${packageName}: ${error} \n ${stderr}`);
                reject(error.status);
            }
            resolve(stdout);
        });
    });
}

function updateDependency(pkg, dependency) {
    new Promise((resolve, reject) => {
        if (pkg.hasDep) {
            pkg.pkgJson.dependencies[dependency.npmName] = dependency.newVersion;
        }
        if (pkg.hasDevDep) {
            pkg.pkgJson.devDependencies[dependency.npmName] = dependency.newVersion;
        }
        fs.writeFile(
            path.resolve(__dirname, '..', pkg.name, 'package.json'),
            JSON.stringify(pkgJson, null, 2),
            error => {
                if (error) {
                    reject(error);
                }
                resolve(pkg);
            }
        );
    });
}

function commitDependencyBump(pkg, dependency) {
    return new Promise((resolve, reject) => {
        exec(`
            git add ./package.json \
            && git commit -m \"dependencyBump(${pkg.name}): ${dependency.name}@${dependency.versionChange}" \
        `, {
            cwd: path.resolve(__dirname, '..', pkg.name),
            encoding: 'utf8',
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Could not commit dependency bump changes for ${pkg.name}: ${error} \n ${stderr}`);
                reject(error.status);
            }
            resolve(stdout);
        });
    });
}

module.exports = function crossUpdate(pkg, packages) {
    return new Promise((resolve, reject) => {
        const updateAllDependencies = packages
            .filter(pkgB => pkgB.name !== pkg.name)
            .filter(pkgB => {
                const pkgBDir = path.resolve(__dirname, '..', pkgB.name);
                const pkgBJSON = require(path.resolve(pkgBDir, 'package.json'));
                const deps = pkgBJSON.dependencies || {};
                const devDeps = pkgBJSON.devDependencies || {};
                const hasDep = pkg.npmName in deps && compareSemver(pkg.newVersion, deps[pkg.npmName]) === 1;
                const hasDevDep = pkg.npmName in devDeps && compareSemver(pkg.newVersion, devDeps[pkg.npmName]) === 1;
                return Object.assign({}, pkgB, {
                    hasDep,
                    hasDevDep,
                    pkgJson: pkgBJSON,
                });
            })
            .filter(pkgB => pkgB.hasDep || pkgB.hasDevDep)
            .map(pkgB => updateDependency(pkgB, pkg))
            .map()

        Promise.all(updateAllDependencies).then();
    });
}
