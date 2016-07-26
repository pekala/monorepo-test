'use strict';

const conventionalChangelog = require('conventional-changelog');
const fs = require('fs');
const findPackages = require('./find-packages');

const theCommitThatStartedTheMonorepo = fs
    .readFileSync(__dirname + '/SEED_COMMIT', 'utf8')
    .trim();

const npmPackages = findPackages();

function isCommitBreakingChange(commit) {
    return (typeof commit.footer === 'string'
        && commit.footer.indexOf('BREAKING CHANGE') !== -1);
}

module.exports = function () {
    return new Promise((resolve, reject) => {
        const status = {};
        npmPackages.forEach(pkg => {
            status[pkg] = {
                increment: 0, // 0 = nothing, 1 = patch, 2 = minor, 3 = major
                commits: [],
            };
        });
        conventionalChangelog({
            preset: 'angular',
            append: true,
            transform: function (commit, cb) {
                if (commit.scope === 'META') {
                    cb();
                    return;
                }

                var pkg = commit.scope;
                var toPush = null;
                if (commit.type === 'fix') {
                    status[pkg].increment = Math.max(status[pkg].increment, 1);
                    toPush = commit;
                }
                if (commit.type === 'feat') {
                    status[pkg].increment = Math.max(status[pkg].increment, 2);
                    toPush = commit;
                }
                if (isCommitBreakingChange(commit)) {
                    status[pkg].increment = Math.max(status[pkg].increment, 3);
                    toPush = commit;
                }
                if (toPush) {
                    status[pkg].commits.push(commit);
                }
                if (commit.type === 'release') {
                    status[pkg].increment = 0;
                    status[pkg].commits = [];
                }
                cb();
            },
        }, {}, { from: theCommitThatStartedTheMonorepo, reverse: true })
        .on('end', () => resolve(status)).resume();
    });
}
