const getRawCommit = require("./get-raw-commit").default as jest.Mock;
const getAffectedPkgs = require("./get-affected-packages").default as jest.Mock;
const getAffectedFiles = require("./get-affected-files").default as jest.Mock;
import { run } from "./main";

jest.mock("./get-raw-commit");
jest.mock("./get-affected-files");
jest.mock("./get-affected-packages");

type TestCommitInfo = {
  hash: string;
  rawMessage: string;
  affectedFiles: string[];
  affectedPkgs: string[];
};

class NoMoreCommitsError extends Error {
  public exitCode: number;
  constructor(message: string) {
    super(message);
    this.exitCode = 128;
  }
}

const prepareMocks = (commits: TestCommitInfo[]) => {
  getRawCommit.mockClear();
  getAffectedPkgs.mockClear();
  getAffectedFiles.mockClear();

  getRawCommit.mockRejectedValue(new NoMoreCommitsError("No more commits"));
  commits.forEach(({ hash, rawMessage }) =>
    getRawCommit.mockResolvedValueOnce({ hash, rawMessage })
  );
  commits.forEach(commit =>
    getAffectedPkgs.mockResolvedValueOnce(commit.affectedPkgs)
  );
  commits.forEach(commit =>
    getAffectedFiles.mockResolvedValueOnce(commit.affectedFiles)
  );
};

const mockCommits: { [name: string]: TestCommitInfo } = {
  pkgAMinor: {
    hash: "cb543277c128c032a2f993bc1a750650b3d17d65",
    rawMessage: "feat: First version of pkg-a",
    affectedFiles: ["packages/pkg-a/index.js"],
    affectedPkgs: ["packages/pkg-a"]
  },
  pkgAPatch: {
    hash: "cb543277c128c032a2f993bc1a750650b3d17d65",
    rawMessage: "fix: A small change to pkg-a",
    affectedFiles: ["packages/pkg-a/index.js"],
    affectedPkgs: ["packages/pkg-a"]
  },
  pkgABreaking: {
    hash: "aa543277c128c032a2f993bc1a750650b3d17d69",
    rawMessage:
      "feat: A big change that breaks\n\nBREAKING CHANGE: breaks everything",
    affectedFiles: ["packages/pkg-a/index.js"],
    affectedPkgs: ["packages/pkg-a"]
  },
  pkgBMinor: {
    hash: "d8e097c114992e57b8019fed2f48c2645134ab21",
    rawMessage: "feat: First version of pkg-b",
    affectedFiles: ["packages/pkg-b/hello.js"],
    affectedPkgs: ["packages/pkg-b"]
  },
  pkgBPatch: {
    hash: "cc543277c128c032a2f993bc1a750650b3d17d69",
    rawMessage: "fix: A small fix for pkg-b",
    affectedFiles: ["packages/pkg-b/package.json"],
    affectedPkgs: ["packages/pkg-b"]
  },
  pkgABMinor: {
    hash: "zz543277c128c032a2f993bc1a750650b3d17d69",
    rawMessage: "feat: A small feature for pkg-a and pkg-b",
    affectedFiles: ["packages/pkg-a/index.js", "packages/pkg-b/index.js"],
    affectedPkgs: ["packages/pkg-a", "packages/pkg-b"]
  }
};

describe("main", () => {
  it("handles a single commit", async () => {
    const commits = [mockCommits.pkgAMinor];
    prepareMocks(commits);
    const result = await run();
    expect(result).toEqual({
      "packages/pkg-a": {
        increment: "minor",
        commits: expect.any(Array)
      }
    });
  });

  it("handles commits in multiple packages ", async () => {
    const commits = [mockCommits.pkgAMinor, mockCommits.pkgBMinor];
    prepareMocks(commits);
    const result = await run();
    expect(result).toEqual({
      "packages/pkg-a": {
        increment: "minor",
        commits: expect.any(Array)
      },
      "packages/pkg-b": {
        increment: "minor",
        commits: expect.any(Array)
      }
    });
  });

  it("handles multiple commits for one package", async () => {
    const commits = [
      mockCommits.pkgAMinor,
      mockCommits.pkgBPatch,
      mockCommits.pkgAPatch
    ];
    prepareMocks(commits);
    const result = await run();
    expect(result).toEqual({
      "packages/pkg-a": {
        increment: "minor",
        commits: expect.any(Array)
      },
      "packages/pkg-b": {
        increment: "patch",
        commits: expect.any(Array)
      }
    });
  });

  it("handles a single commit in multiple packages", async () => {
    const commits = [
      mockCommits.pkgAPatch,
      mockCommits.pkgBPatch,
      mockCommits.pkgABMinor
    ];
    prepareMocks(commits);
    const result = await run();
    expect(result).toEqual({
      "packages/pkg-a": {
        increment: "minor",
        commits: expect.any(Array)
      },
      "packages/pkg-b": {
        increment: "minor",
        commits: expect.any(Array)
      }
    });
  });

  it("handles commits with breaking changes", async () => {
    const commits = [mockCommits.pkgAMinor, mockCommits.pkgABreaking];
    prepareMocks(commits);
    const result = await run();
    expect(result).toEqual({
      "packages/pkg-a": {
        increment: "major",
        commits: expect.any(Array)
      }
    });
  });
});
