import { App } from "@octokit/app";
import Octokit from "@octokit/rest";

const {
  GITHUB_APP_PRIVATE_KEY,
  GITHUB_APP_ID,
  GITHUB_INSTALLATION_ID
} = process.env;

const privateKey = Buffer.from(GITHUB_APP_PRIVATE_KEY, "base64").toString(
  "ascii"
);
const app = new App({ id: parseInt(GITHUB_APP_ID, 10), privateKey });

let accessToken: string;
export async function getAccessToken() {
  if (accessToken) {
    return accessToken;
  }
  accessToken = await app.getInstallationAccessToken({
    installationId: parseInt(GITHUB_INSTALLATION_ID, 10)
  });
  return accessToken;
}

const octokit = new Octokit({
  async auth() {
    return `token ${await getAccessToken()}`;
  }
});

export default octokit;
