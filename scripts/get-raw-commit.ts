import execa from "execa";
const DELIMITER = ">>><<<";

export default async function getRawCommit(cursor: string) {
  const { stdout } = await execa("git", [
    "log",
    `--format=%H${DELIMITER}%B`,
    "-n",
    "1",
    cursor
  ]);

  const [hash, rawMessage] = stdout.split(DELIMITER);
  return { hash, rawMessage };
}
