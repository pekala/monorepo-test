#!/usr/bin/env node
'use strict';

const fs = require('fs');
const bumpPackageVersion = require('./bump-package-version');
const checkAllForRelease = require('./check-all-for-release');
const commitReleaseAll = require('./commit-release-all');
const crossUpdate = require('./cross-update');
const findPackages = require('./find-packages');
const getIntiailCommit = require('./get-initial-commit');
const npmPublishPackage = require('./npm-publish-package');
const updateChangelog = require('./update-changelog');

Promise.resolve()
    .then(() => Promise.all([findPackages(), getIntiailCommit()]))
    .then(results => checkAllForRelease(results[0], results[1]))
    .then(packages => Promise.all(packages.map(pkg => bumpPackageVersion(pkg))))
    .then(packages => Promise.all(packages.map(pkg => updateChangelog(pkg))))
    .then(packages => commitReleaseAll(packages))
    .then(packages => Promise.all(packages.map(pkg => npmPublishPackage(pkg))))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

