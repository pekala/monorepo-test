#!/usr/bin/env node
'use strict';

const conventionalChangelog = require('conventional-changelog');
const addStream = require('add-stream');
const tempfile = require('tempfile');
const fs = require('fs');
const findPackages = require('./find-packages');

const theCommitThatStartedTheMonorepo = fs
    .readFileSync(__dirname + '/SEED_COMMIT', 'utf8')
    .trim();

const npmPackages = findPackages();

const argPackage = process.argv[2];

// Assume that for each package we will start iterating from
// theCommitThatStartedTheMonorepo onwards.
const startCommits = {};
packages.forEach(package => startCommits[package] = theCommitThatStartedTheMonorepo);

// Update the startCommit for each package, looking for release commits
// for each package.
conventionalChangelog({
    preset: 'angular',
    append: true,
    transform: function (commit, cb) {
        if (commit.type === 'release') {
            startCommits[commit.scope] = commit.hash;
        }
        cb();
    }
}, {}, { from: theCommitThatStartedTheMonorepo, reverse: true })
    .on('end', runUpdateChangelogs).resume();

function runUpdateChangelogs() {
    packages
        .filter(package => {
            if (typeof argPackage === 'string' && argPackage.length > 0) {
                return argPackage === package;
            } else {
                return true;
            }
        })
        .forEach(package => {
            console.log('updating changelog for package ' + package);
            var filename = __dirname + '/../' + package + '/CHANGELOG.md';
            var changelogOpts = {
                preset: 'angular',
                releaseCount: 0,
                pkg: {
                    path: __dirname + '/../' + package + '/package.json',
                },
                transform: function (commit, cb) {
                    if (commit.scope === package) {
                        cb(null, commit);
                    } else {
                        cb();
                    }
                },
            };
            var gitRawCommitsOpts = { from: startCommits[package] };

            var readStream = fs.createReadStream(filename);
            var tmp = tempfile();
            conventionalChangelog(changelogOpts, {}, gitRawCommitsOpts)
                .pipe(addStream(readStream))
                .pipe(fs.createWriteStream(tmp))
                .on('finish', function () {
                    fs.createReadStream(tmp)
                        .pipe(fs.createWriteStream(filename));
                });
        })
}
