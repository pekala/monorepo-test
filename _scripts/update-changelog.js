const path = require('path');
const fs = require('fs');
const addStream = require('add-stream');
const tempfile = require('tempfile');
const conventionalChangelog = require('conventional-changelog');

module.exports = function updateChangelog(pkg) {
    return new Promise((resolve, reject) => {
        if (!pkg.versionChange) {
            resolve(pkg);
            return;
        }

        const pkgDir = path.resolve(__dirname, '..', pkg.name);
        const changelogFile = path.resolve(pkgDir, 'CHANGELOG.md');
        const readStream = fs.createReadStream(changelogFile);
        const tmp = tempfile();

        conventionalChangelog({
            preset: 'angular',
            releaseCount: 0,
            pkg: {
                path: path.resolve(pkgDir, 'package.json'),
            },
            transform: function (commit, cb) {
                if (commit.scope === pkg.name) {
                    cb(null, commit);
                } else {
                    cb();
                }
            },
        }, {}, {
            from: pkg.latestReleaseCommit.hash,
        })
        .pipe(addStream(readStream))
        .pipe(fs.createWriteStream(tmp))
        .on('error', error => reject(error))
        .on('finish', () => {
            fs.createReadStream(tmp).pipe(fs.createWriteStream(changelogFile));
            resolve(pkg);
        });
    });
}
