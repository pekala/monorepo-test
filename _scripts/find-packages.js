'use strict';

const path = require('path');
const execSync = require('child_process').execSync;

module.exports = function () {
    let packages;
    try {
        packages = execSync('find * -maxdepth 0 -type d | grep -Ev \'^(_)|node_modules\'', {
            cwd: path.resolve(__dirname, '..'),
            encoding: 'utf8',
        });
    } catch(error) {
        console.error(`Could not list the packages: ${error}`);
        process.exit(error.status);
    }
    return packages
        .trim()
        .split('\n');
}

