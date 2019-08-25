import execa from "execa";

export default async function getAffectedFiles(hash: string) {
  const { stdout } = await execa("git", [
    "diff-tree",
    "--no-commit-id",
    "--name-only",
    "-r",
    hash
  ]);
  
  return stdout.split("\n");
}
