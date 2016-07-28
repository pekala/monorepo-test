#!/usr/bin/env node
'use strict';

const checkPackageRelease = require('./check-package-release');

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

function showReportHeaderPositive() {
    console.log('RELEASES TO DO\n\n' +
        'We checked all packages and recent commits, and discovered that\n' +
        'according to semver.org you should release new versions for the\n' +
        'following packages.\n');
}

function showReportHeaderNegative() {
    console.log('Nothing to release.\n\n' +
        'We checked all packages and recent commits, and discovered that\n' +
        'you do not need to release any new version, according to semver.org.')
}

function showReport(status) {
    const headerShown = false;
    for (let pkg in status) {
        if (status.hasOwnProperty(pkg) && status[pkg].increment > 0) {
            if (!headerShown) {
                showReportHeaderPositive();
                headerShown = true;
            }

            console.log('`' + pkg + '` needs a new ' +
                incrementName(status[pkg].increment).toUpperCase() +
                ' version released because:');
            status[pkg].commits.forEach(function (commit) {
                console.log('  . ' + commit.header);
                if (isCommitBreakingChange(commit)) {
                    console.log('    BREAKING CHANGE');
                }
            });
            console.log('');
        }
    }
    if (!headerShown) {
        showReportHeaderNegative();
    }
}

checkPackageRelease().then(status => showReport(status));
