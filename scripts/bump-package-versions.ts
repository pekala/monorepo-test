import path from "path";
import execa from "execa";
import { Increment } from "types";

export default async function bumpPackageVersions(
  pkgDir: string,
  increment: Increment
) {
  if (increment === false) {
    return;
  }
  await execa("yarn", ["version", "--no-git-tag-version", `--${increment}`], {
    cwd: path.resolve(__dirname, pkgDir)
  });
}
