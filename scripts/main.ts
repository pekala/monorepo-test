import { plugins, applyPlugins, parse } from "parse-commit-message";
import getRawCommit from "./get-raw-commit";
import getAffectedFiles from "./get-affected-files";
import getAffectedPkgs from "./get-affected-pkgs";
import bumpPkgVersions from "./bump-pkg-version";
import { Increment } from "types";

const BUMPS: Increment[] = [false, "patch", "minor", "major"];

async function parseCommit(rawMessage: string) {
  const commit = await parse(rawMessage);
  return applyPlugins(plugins, commit)[0];
}

async function* walkCommits() {
  let cursor = "HEAD";
  while (true) {
    try {
      const { hash, rawMessage } = await getRawCommit(cursor);
      const commit = await parseCommit(rawMessage);
      const affectedFiles = await getAffectedFiles(hash);
      const affectedPkgs = await getAffectedPkgs(affectedFiles);

      yield { hash, affectedFiles, affectedPkgs, commit };
      cursor = `${hash}^1`;
    } catch (error) {
      if (error.exitCode === 128) {
        return;
      }
      throw error;
    }
  }
}

export async function run() {
  let byPkg: {
    [pkgDir: string]: { commits: any[]; increment: Increment };
  } = {};

  for await (let data of walkCommits()) {
    data.affectedPkgs.forEach(affectedPkg => {
      byPkg[affectedPkg] = byPkg[affectedPkg] || {
        commits: [],
        increment: BUMPS[0]
      };
      const commits = byPkg[affectedPkg];
      commits.commits.push(data);
      commits.increment =
        BUMPS.indexOf(data.commit.increment) > BUMPS.indexOf(commits.increment)
          ? data.commit.increment
          : commits.increment;
    });
  }

  for await (let pkgDir of Object.keys(byPkg)) {
    await bumpPkgVersions(pkgDir, byPkg[pkgDir].increment);
  }

  return byPkg;
}

run().catch(error => console.error(error));
