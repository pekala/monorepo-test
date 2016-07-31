const commitRelease = require('./commit-release');

module.exports = function commitReleaseAll(packages) {
    return packages
        .reduce(
            (promise, pkg) => promise.then(() => commitRelease(pkg)),
            Promise.resolve()
        )
        .then(() => packages);
}
