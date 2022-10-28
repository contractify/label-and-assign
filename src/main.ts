import * as core from "@actions/core";
import * as github from "@actions/github";

import * as common from "./common/common";
import * as helpers from "./common/helpers";
import { runLabeler } from "./labeler/labeler";
import { runAssigner } from "./assigner/assigner";
import { runOwner } from "./owner/owner";

export async function run() {
  if (github.context.actor === "dependabot[bot]") {
    core.info(`🚨 Dependabot, ignoring`);
    return;
  }

  const token = core.getInput("token", { required: true });
  const configPath = core.getInput("configuration-path", { required: true });
  const githubClient: common.ClientType = github.getOctokit(token);

  const prNumber = await helpers.getPrNumber(githubClient);
  if (!prNumber) {
    core.warning("⚠️ Could not get pull request number, exiting");
    return;
  }

  const branchName = helpers.getBranchName();
  core.info(`📄 Context details`);
  core.info(`    Branch name: ${branchName}`);

  if (branchName.startsWith("dependabot")) {
    core.info(`🚨 Dependabot, ignoring`);
    return;
  }

  core.info(`📄 Pull request number: ${prNumber}`);

  const pr = await helpers.getPrDetails(githubClient, prNumber);

  core.info(`🏭 Running labeler for ${prNumber}`);
  await runLabeler(githubClient, configPath, prNumber);

  if (pr?.draft) {
    core.info(`🏭 Skipping assigner for ${prNumber} (draft)`);
  } else {
    core.info(`🏭 Running assigner for ${prNumber}`);
    await runAssigner(githubClient, configPath, prNumber);
  }

  core.info(`🏭 Running owner for ${prNumber}`);
  await runOwner(githubClient, prNumber);

  core.info(`📄 Finished for pull request ${prNumber}`);
}

run();
