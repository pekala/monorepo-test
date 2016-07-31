'use strict';

const fs = require('fs');
const path = require('path');
const SEED_COMMIT_FILE = path.resolve(__dirname, 'SEED_COMMIT');

module.exports = function getInitialCommit() {
    return new Promise((resolve, reject) => {
        fs.readFile(SEED_COMMIT_FILE, 'utf8', (error, data) => {
            if (error) {
                reject(error);
            }
            resolve(data);
        });
    }).then(fileContent => fileContent.trim());
}
