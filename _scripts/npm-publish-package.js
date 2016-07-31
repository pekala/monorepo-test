const exec = require('child_process').exec;
const path = require('path');

module.exports = function npmPubllishPackage(pkg) {
    return new Promise((resolve, reject) => {
        if (!pkg.versionChange) {
            resolve(pkg);
            return;
        }
        console.log(`Publishing ${pkg.name}`);
        exec('npm publish', {
            cwd: path.resolve(__dirname, '..', pkg.name),
            encoding: 'utf8',
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Could not publish ${pkg.name}: ${error} \n ${stderr}`);
                reject(error.status);
            }
            resolve(stdout);
        });
    });
}
