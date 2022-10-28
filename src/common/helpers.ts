import * as github from "@actions/github";
import * as core from "@actions/core";
import * as common from "./common";

import type { GithubLabel, GithubReviewer } from "./common";

export async function fetchContent(
  client: common.ClientType,
  repoPath: string
): Promise<string> {
  const response: any = await client.rest.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: repoPath,
    ref: github.context.sha,
  });

  return Buffer.from(response.data.content, response.data.encoding).toString();
}

export function getBranchName(): string {
  return (
    github.context.payload.pull_request?.head.ref || github.context.ref
  ).replace("refs/heads/", "");
}

export async function getPullRequest(
  client: common.ClientType
): Promise<common.PullRequestDetails | undefined> {
  const result = await client.rest.repos.listPullRequestsAssociatedWithCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    commit_sha: github.context.sha,
  });

  const pr = result.data
    .filter((el) => el.state === "open")
    .find((el) => {
      return github.context.payload.ref === `refs/heads/${el.head.ref}`;
    });

  if (pr === undefined) {
    return undefined;
  }

  return {
    prNumber: pr.number,
    title: pr.title,
    labels: pr.labels.map((item) => item.name),
    reviewers:
      pr.requested_reviewers
        ?.filter(
          (reviewer) => reviewer.name !== null && reviewer.name !== undefined
        )
        .map((reviewer) => reviewer.name ?? "") ?? [],
    baseSha: pr.base.sha,
    owner: pr.assignee?.name,
    draft: pr.draft,
  };
}

export async function getChangedFiles(
  client: common.ClientType,
  prNumber: number
): Promise<string[]> {
  var changedFiles: string[] = [];
  var page = 0;
  while (true) {
    page++;
    const listFilesOptions = client.rest.pulls.listFiles.endpoint.merge({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber,
      page: page,
      per_page: 100,
    });
    const listFilesResponse = await client.paginate(listFilesOptions);
    listFilesResponse.forEach((f: any) => changedFiles.push(f.filename));
    if (listFilesResponse.length < 100) {
      break;
    }
  }

  if (changedFiles.length > 0) {
    core.info("📄 Changed files");
    for (const file of changedFiles) {
      core.info(`    Changed file: ${file}`);
    }
  }

  return changedFiles;
}

export async function getPrReviewersAndAssignees(
  client: common.ClientType,
  prNumber: number
): Promise<common.PullRequestDetails | undefined> {
  try {
    const pullRequest = await client.rest.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber,
    });

    const labels = pullRequest.data.labels as GithubLabel[];
    const reviewers = pullRequest.data.requested_reviewers as GithubReviewer[];

    return {
      prNumber: prNumber,
      title: pullRequest.data.title,
      labels: labels.map((label) => label.name),
      reviewers: reviewers.map((reviewer) => reviewer.login),
      baseSha: pullRequest.data.base?.sha,
      owner: pullRequest.data.user?.login,
      draft: pullRequest.data.draft,
    };
  } catch (error: any) {
    core.error(`🚨 Failed to get PR details: ${error}`);
    return undefined;
  }
}
