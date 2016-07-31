#!/usr/bin/env node
'use strict';

const checkAllForRelease = require('./check-all-for-release');
const findPackages = require('./find-packages');
const getIntiailCommit = require('./get-initial-commit');

function isCommitBreakingChange(commit) {
    return (typeof commit.footer === 'string'
        && commit.footer.indexOf('BREAKING CHANGE') !== -1);
}

function showReport(packages) {
    if (!packages.length) {
        console.log(`\
Nothing to release

We checked all packages and recent commits, and discovered that
CI will not need to release any new version, according to semver.org.
        `)
        return;
    }

    console.log(`\
RELEASES TO DO

We checked all packages and recent commits, and discovered that
according to semver.org CI will release new versions for the
following packages:
    `);

    packages.forEach(pkg => {
        console.log(`${pkg.name} needs a new ${pkg.versionChange} version released because:`);
        pkg.commitsSinceRelease.forEach(commit => {
            console.log(`>> ${commit.header} ${isCommitBreakingChange(commit) && '(BREAKING CHANGE)'}`);
        });
        console.log();
    });
}

Promise.resolve()
    .then(() => Promise.all([findPackages(), getIntiailCommit()]))
    .then(results => checkAllForRelease(results[0], results[1]))
    .then(packages => packages.filter(pkg => !pkg.newVersion))
    .then(packages => showReport(packages))
    .catch(error => console.error(error));
