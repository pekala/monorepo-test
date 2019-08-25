import { Increment } from "types";

declare module "parse-commit-message" {
  type Header = {
    type: string;
    scope?: string | null;
    subject: string;
  };

  type Mention = {
    handle: string;
    mention: string;
    index: number;
  };

  type Commit = {
    header: Header;
    body?: string | null;
    footer?: string | null;
    increment: Increment;
    isBreaking: boolean;
    mentions?: Array<Mention>;
  };

  export function parseCommit(commit: string): Commit;
  export function parse(commit: string): Commit[];
  export function applyPlugins(plugins: Object[], commit: Commit[]): Commit[];
  export const plugins: Object[];
}
