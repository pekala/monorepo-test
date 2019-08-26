import octokit from "./get-github-api";
import pkgJSON from "../package.json";

const [owner, repo] = pkgJSON.repository.split("/");

export default async function createGithubRelease(tagName: string) {
  octokit.repos.createRelease({
    owner,
    repo,
    tag_name: tagName
  });
}
