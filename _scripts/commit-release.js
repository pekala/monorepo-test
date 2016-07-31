const exec = require('child_process').exec;
const path = require('path');

module.exports = function commitRelease(pkg) {
    return new Promise((resolve, reject) => {
        if (!pkg.versionChange) {
            resolve(pkg);
            return;
        }
        console.log(`Creating git release commit for version ${pkg.newVersion} of ${pkg.name}`);
        exec(`git add -A . && git commit -m \"release(${pkg.name}): ${pkg.newVersion}" && git push origin master`, {
            cwd: path.resolve(__dirname, '..', pkg.name),
            encoding: 'utf8',
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Could not commit and push release changes for ${pkg.name}: ${error} \n ${stderr}`);
                reject(error.status);
            }
            resolve(pkg);
        });
    });
}
