import * as core from "@actions/core";
import * as github from "@actions/github";
import { Context } from "@actions/github/lib/context";

import * as common from "../common/common";

export async function runOwner(client: common.ClientType, prNumber: number) {
  try {
    const context: Context = github?.context;

    const assignees = getAssigneeOrAssignees(context);
    if (assignees.length > 0) {
      core.info(`    🚨 Pull request is already assigned`);
      return;
    }

    await client.rest.issues.addAssignees({
      owner: context?.repo?.owner,
      repo: context?.repo?.repo,
      issue_number: prNumber,
      assignees: [context?.actor],
    });

    core.info(`    Assigning owner: ${context?.actor}`);
  } catch (error: any) {
    core.error(`    🚨 ${error}`);
    core.setFailed(error.message);
  }
}

function getAssigneeOrAssignees(context: Context): string[] {
  let assignees: string[] = context?.payload?.pull_request?.assignee
    ? [context?.payload?.pull_request?.assignee]
    : [];

  context?.payload?.pull_request?.assignees?.forEach((assignee: string) => {
    assignees.push(assignee);
  });

  return assignees?.length > 0 ? assignees : [];
}
