const conventionalChangelog = require('conventional-changelog');
const fs = require('fs');

const theCommitThatStartedTheMonorepo = fs
    .readFileSync(__dirname + '/SEED_COMMIT', 'utf8')
    .trim();

const npmPackages = fs
    .readFileSync(__dirname + '/PACKAGES', 'utf8')
    .trim()
    .split('\n');

function isCommitBreakingChange(commit) {
    return (typeof commit.footer === 'string'
        && commit.footer.indexOf('BREAKING CHANGE') !== -1);
}

module.exports = function () {
    return new Promise((resolve, reject) => {
        const status = {};
        npmPackages.forEach(package => {
            status[package] = {
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

                var package = commit.scope;
                var toPush = null;
                if (commit.type === 'fix') {
                    status[package].increment = Math.max(status[package].increment, 1);
                    toPush = commit;
                }
                if (commit.type === 'feat') {
                    status[package].increment = Math.max(status[package].increment, 2);
                    toPush = commit;
                }
                if (isCommitBreakingChange(commit)) {
                    status[package].increment = Math.max(status[package].increment, 3);
                    toPush = commit;
                }
                if (toPush) {
                    status[package].commits.push(commit);
                }
                if (commit.type === 'release') {
                    status[package].increment = 0;
                    status[package].commits = [];
                }
                cb();
            },
        }, {}, { from: theCommitThatStartedTheMonorepo, reverse: true })
        .on('end', () => resolve(status)).resume();
    });
}
