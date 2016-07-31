'use strict';

const execSync = require('child_process').execSync;

let packages;
try {
    packages = execSync('find * -maxdepth 0 -type d | grep -Ev \'^(_)|node_modules\'', {
        cwd: __dirname,
        encoding: 'utf8',
    });
} catch(error) {
    console.error(`Could not list the packages: ${error}`);
    process.exit(error.status);
}
const packageScopes = packages
    .trim()
    .split('\n')
    .map(pkg => ({ name: pkg }));

module.exports = {
    types: [
        { value: 'feat',     name: 'feat:     Add a new feature' },
        { value: 'fix',      name: 'fix:      Submit a bug fix' },
        { value: 'refactor', name: 'refactor: A code change that neither fixes a bug nor adds a feature' },
        { value: 'test',     name: 'test:     Add tests only' },
        { value: 'init',     name: 'init:     Initializing new package' },
        { value: 'docs',     name: 'docs:     Documentation only changes' },
        { value: 'chore',    name: 'chore:    Changes to the build process or auxiliary tools\n            and libraries such as documentation generation. META only.' },
        { value: 'style',    name: 'style:    Changes that do not affect the meaning of the code\n            (white-space, formatting, missing semi-colons, etc)' },
    ],

    scopes: [
        { name: 'META' },
    ].concat(packageScopes),

    scopeOverrides: {
        chore: [
            { name: 'META' },
        ]
    },

    allowCustomScopes: false,
    allowBreakingChanges: ['feat', 'fix'],
};
