'use strict';

const conventionalChangelog = require('conventional-changelog');
const fs = require('fs');

function isCommitBreakingChange(commit) {
    return (typeof commit.footer === 'string'
        && commit.footer.indexOf('BREAKING CHANGE') !== -1);
}

function incrementName(code) {
    if (code === 1) {
        return 'patch';
    } else if (code === 2) {
        return 'minor';
    } else if (code === 3) {
        return 'major';
    } else {
        return '';
    }
}

module.exports = function checkPackageRelease(packages, initialCommit) {
    return new Promise((resolve, reject) => {
        const status = {};
        packages.forEach(pkg => {
            status[pkg.name] = {
                increment: 0, // 0 = nothing, 1 = patch, 2 = minor, 3 = major
                commitsSinceRelease: [],
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
                if (commit.type === 'init' || isCommitBreakingChange(commit)) {
                    status[pkg].increment = Math.max(status[pkg].increment, 3);
                    toPush = commit;
                }
                if (toPush) {
                    status[pkg].commitsSinceRelease.push(commit);
                }
                if (commit.type === 'release') {
                    status[pkg].increment = 0;
                    status[pkg].latestReleaseCommit = commit;
                    status[pkg].commitsSinceRelease = [];
                }
                cb();
            },
        }, {},
        {
            from: initialCommit,
            reverse: true,
        })
        .on('end', () => resolve(status))
        .resume();
    }).then(status => packages.map(pkg => Object.assign({}, pkg, status[pkg.name], {
        versionChange: incrementName(status[pkg.name].increment),
    })))
}
