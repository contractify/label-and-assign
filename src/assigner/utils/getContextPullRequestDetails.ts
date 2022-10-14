import * as core from "@actions/core";
import * as github from "@actions/github";

import type { GithubLabel, GithubReviewer } from "../types";

import * as common from "../../common/common";

export type ContextPullRequestDetails = {
  labels: string[];
  reviewers: string[];
  baseSha: string;
};

export async function getContextPullRequestDetails(
  client: common.ClientType
): Promise<ContextPullRequestDetails | undefined> {
  try {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
      const result =
        await client.rest.repos.listPullRequestsAssociatedWithCommit({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          commit_sha: github.context.sha,
        });

      const pullRequest = result.data
        .filter((el) => el.state === "open")
        .find((el) => {
          return github.context.payload.ref === `refs/heads/${el.head.ref}`;
        });

      if (pullRequest !== undefined) {
        core.info(`📄 Linked PR: ${pullRequest.number} | ${pullRequest.title}`);
      }
    }

    if (pullRequest === undefined) {
      return undefined;
    }

    const labels = pullRequest.labels as GithubLabel[];
    const reviewers = pullRequest.requested_reviewers as GithubReviewer[];

    return {
      labels: labels.map((label) => label.name),
      reviewers: reviewers.map((reviewer) => reviewer.login),
      baseSha: pullRequest?.base?.sha,
    };
  } catch (error: any) {
    core.error(`🚨 Failed to get PR number: ${error}`);
    return undefined;
  }
}
