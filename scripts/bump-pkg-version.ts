import path from "path";
import execa from "execa";
import getPkgName from "./get-pkg-name";
import { Increment } from "types";
import { getAccessToken } from "./get-github-api";
import pkgJSON from "../package.json";

export default async function bumpPkgVersion(
  pkgDir: string,
  increment: Increment
) {
  if (increment === false) {
    return;
  }
  const pkgName = await getPkgName(pkgDir);
  await execa("yarn", ["version", `--${increment}`], {
    cwd: path.resolve(process.cwd(), pkgDir),
    env: {
      YARN_VERSION_GIT_MESSAGE: `chore(release): ${pkgName}@v%s`,
      YARN_VERSION_TAG_PREFIX: `${pkgName}@v`
    }
  });
  const accessToken = await getAccessToken();
  await execa("git", [
    "push",
    "--follow-tags",
    `https://x-access-token:${accessToken}@github.com/${pkgJSON.repository}.git`
  ]);
}
