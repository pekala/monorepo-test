#!/usr/bin/env node
'use strict';

const fs = require('fs');
const checkPackageRelease = require('./check-package-release');
const releasePackage = require('./release-package');
const findPackages = require('./find-packages');

const npmPackages = findPackages();

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

checkPackageRelease().then(releaseStatus => {
    npmPackages.forEach(pkg => {
        console.log(`> (${pkg}) \n> ... check if it needs a new version released, and publishes`);
        const incrementValue = releaseStatus[pkg].increment;
        if (incrementValue > 0) {
            console.log(`> Releasing new ${incrementName(incrementValue)} version of ${pkg}\n`);
            releasePackage(pkg, incrementName(incrementValue));
        } else {
            console.log(`> Nope, all clean in ${pkg}\n`);
        }
    });
}).catch(error => {
    console.error(error);
    process.exit(1);
});

