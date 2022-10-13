import * as github from "@actions/github";

export interface MatchConfig {
  all?: string[];
  any?: string[];
}

export type StringOrMatchConfig = string | MatchConfig;

export type ClientType = ReturnType<typeof github.getOctokit>;
