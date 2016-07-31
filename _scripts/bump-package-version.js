const exec = require('child_process').exec;
const path = require('path');

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

module.exports = function bumpPackageVersion(pkg) {
    return new Promise((resolve, reject) => {
        if (!pkg.versionChange) {
            resolve('');
            return;
        }
        console.log(`Bumping the ${pkg.versionChange} version of ${pkg.name}`);
        exec(`npm --no-git-tag-version version ${pkg.versionChange}`, {
            cwd: path.resolve(__dirname, '..', pkg.name),
            encoding: 'utf8',
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Could not bump the version for ${pkg.name}: ${error} \n ${stderr}`);
                reject(error.status);
            }
            resolve(stdout);
        });
    }).then(version => Object.assign({}, pkg, {
        newVersion: version.trim().substring(1),
    }));
}
