'use strict';

const exec = require('child_process').exec;
const path = require('path');

module.exports = function findPackages() {
    return new Promise((resolve, reject) => {
        exec('find * -maxdepth 0 -type d | grep -Ev \'^(_)|node_modules\'', {
            cwd: path.resolve(__dirname, '..'),
            encoding: 'utf8',
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Could not list the packages: ${error} \n ${stderr}`);
                reject(error.status);
            }
            resolve(stdout);
        });
    }).then(stdout => stdout
        .trim()
        .split('\n')
        .map(pkg => ({
            name: pkg,
            npmName: require(path.resolve(__dirname, '..', pkg, 'package.json')).name
        }))
    );
}
