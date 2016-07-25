#!/usr/bin/env node

var execSync = require('child_process').execSync;

var packageName = process.argv[2];
var updateType = process.argv[3];
var packageDir = __dirname + '/../' + packageName;

var newVersion;
console.log(`Bumping the ${updateType} version of ${packageName}`)
try {
    newVersion = execSync(`npm --no-git-tag-version version ${updateType}`, {
        cwd: packageDir,
        encoding: 'utf8',
    });
} catch(e) {
    console.error(`Could not bump the version for ${packageName}: ${e}`);
    process.exit(1);
}
console.log(`New version will be ${newVersion}`);

var changelogOutput;
console.log(`Updating the changelog of ${packageName}`)
try {
    changelogOutput = execSync(`node update-changelog ${packageName}`, {
        cwd: __dirname,
        encoding: 'utf8',
    });
} catch(e) {
    console.error(`Could not update the changelog for ${packageName}: ${e}`);
    process.exit(1);
}
console.log(changelogOutput);

var gitOutput;
try {
    gitOutput = execSync(`git add -A . && git commit -m \"release(${packageName}): ${newVersion}" && git push origin master`, {
        cwd: packageDir,
        encoding: 'utf8',
    });
} catch(e) {
    console.error(`Could not commit and push release changes for ${packageName}: ${e}`);
    process.exit(1);
}
console.log(gitOutput);

var npmPublishOutput;
try {
    npmPublishOutput = execSync(`npm publish`, {
        cwd: packageDir,
        encoding: 'utf8',
    });
} catch(e) {
    console.error(`Could not publish ${packageName}@${newVersion}: ${e}`);
    process.exit(1);
}
console.log(npmPublishOutput);
