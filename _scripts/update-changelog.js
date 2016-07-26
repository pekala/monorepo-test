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
npmPackages.forEach(pkg => startCommits[pkg] = theCommitThatStartedTheMonorepo);

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
    npmPackages
        .filter(pkg => {
            if (typeof argPackage === 'string' && argPackage.length > 0) {
                return argPackage === pkg;
            } else {
                return true;
            }
        })
        .forEach(pkg => {
            console.log('updating changelog for package ' + pkg);
            var filename = __dirname + '/../' + pkg + '/CHANGELOG.md';
            var changelogOpts = {
                preset: 'angular',
                releaseCount: 0,
                pkg: {
                    path: __dirname + '/../' + pkg + '/package.json',
                },
                transform: function (commit, cb) {
                    if (commit.scope === pkg) {
                        cb(null, commit);
                    } else {
                        cb();
                    }
                },
            };
            var gitRawCommitsOpts = { from: startCommits[pkg] };

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
