import * as github from "@actions/github";

export type ClientType = ReturnType<typeof github.getOctokit>;

export type PullRequestDetails = {
  prNumber: number;
  title: string;
  labels: string[];
  reviewers: string[];
  baseSha: string;
  owner: string | undefined | null;
  draft: boolean | undefined | null;
};

export interface GithubLabel {
  name: string;
}

export interface GithubReviewer {
  login: string;
}
