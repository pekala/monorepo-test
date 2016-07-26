'use strict';

const execSync = require('child_process').execSync;

module.exports = function (packageName, updateType) {
    var packageDir = __dirname + '/../' + packageName;

    var newVersion;
    console.log(`Bumping the ${updateType} version of ${packageName}`)
    try {
        newVersion = execSync(`npm --no-git-tag-version version ${updateType}`, {
            cwd: packageDir,
            encoding: 'utf8',
        });
    } catch(error) {
        console.error(`Could not bump the version for ${packageName}: ${error}`);
        process.exit(error.status);
    }
    console.log(`New version will be ${newVersion}`);

    var changelogOutput;
    console.log(`Updating the changelog of ${packageName}`)
    try {
        changelogOutput = execSync(`node update-changelog ${packageName}`, {
            cwd: __dirname,
            encoding: 'utf8',
        });
    } catch(error) {
        console.error(`Could not update the changelog for ${packageName}: ${error}`);
        process.exit(error.status);
    }
    console.log(changelogOutput);

    var gitOutput;
    try {
        gitOutput = execSync(`git add -A . && git commit -m \"release(${packageName}): ${newVersion}" && git push origin master`, {
            cwd: packageDir,
            encoding: 'utf8',
        });
    } catch(error) {
        console.error(`Could not commit and push release changes for ${packageName}: ${error}`);
        process.exit(error.status);
    }
    console.log(gitOutput);

    var npmPublishOutput;
    try {
        npmPublishOutput = execSync(`npm publish`, {
            cwd: packageDir,
            encoding: 'utf8',
        });
    } catch(error) {
        console.error(`Could not publish ${packageName}@${newVersion}: ${error}`);
        process.exit(error.status);
    }
    console.log(npmPublishOutput);
}
