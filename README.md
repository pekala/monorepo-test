# Monorepo tooling

This mostly borrows code from [Cycle.js repository](https://github.com/cyclejs/cyclejs), as [described by Andre Staltz](http://staltz.com/setting-up-a-javascript-monorepo.html ).

## Some changes / TODO
- [x] packages do not require npm scripts
- [x] some of the scripts rewritten in JS to ease changes
- [x] feeds the list of packages to commitizen's scope list
- [ ] auto-detect packages (as opposed to keep a list in a file)
- [ ] auto-update cross dependencies versions (after linking and testing)
- [ ] create custom commitizen adapter that auto-detect which package was affected by changes
- [ ] ...

## Commands
- `npm run check-release` to get a list of packages that will be released (to be used on dev machine)
- `npm run cross-link` to `npm link` all inter-dependencies between packages
- `npm run commit` to commit with commitizen
- `npm run release` to release all packages that have some changes unreleased (to be used on CI)
