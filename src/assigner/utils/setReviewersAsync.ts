import { WebhookPayload } from "@actions/github/lib/interfaces";

import * as common from "../../common/common";

interface Options {
  client: common.ClientType;
  reviewers: string[];
  contextPayload: WebhookPayload;
  pullRequestDetails: common.PullRequestDetails;
}

export async function setReviewersAsync(
  options: Options
): Promise<{ url: string } | null> {
  const payload = options.contextPayload;
  const prNumber = options.pullRequestDetails.prNumber;
  const repository = payload.repository;

  if (prNumber === undefined || repository === undefined) {
    throw new Error("Cannot resolve action context");
  }

  if (options.reviewers.length === 0) {
    return null;
  }

  const repoOwner = repository.owner.login;
  const pullNumber = prNumber;
  const repo = repository.name;
  const prOwner = options.pullRequestDetails.owner;

  const reviewers = options.reviewers.filter(
    (reviewer) => reviewer !== prOwner
  );

  if (reviewers.length === 0) {
    return null;
  }

  const result = await options.client.rest.pulls.requestReviewers({
    owner: repoOwner,
    repo,
    pull_number: pullNumber,
    reviewers,
  });

  return {
    url: result.url,
  };
}
