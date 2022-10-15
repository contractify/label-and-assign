import * as core from "@actions/core";
import * as github from "@actions/github";

import * as common from "./common/common";
import * as helpers from "./common/helpers";
import { runLabeler } from "./labeler/labeler";
import { runAssigner } from "./assigner/assigner";
import { runOwner } from "./owner/owner";

export async function run() {
  const token = core.getInput("token", { required: true });
  const configPath = core.getInput("configuration-path", { required: true });
  const client: common.ClientType = github.getOctokit(token);

  const prNumber = await helpers.getPrNumber(client);
  if (!prNumber) {
    core.warning("⚠️ Could not get pull request number, exiting");
    return;
  }

  core.info(`📄 Pull request number: ${prNumber}`);

  core.info(`🏭 Running labeler for ${prNumber}`);
  await runLabeler(client, configPath, prNumber);

  core.info(`🏭 Running assigner for ${prNumber}`);
  await runAssigner(client, configPath, prNumber);

  core.info(`🏭 Running owner for ${prNumber}`);
  await runOwner(client, prNumber);

  core.info(`📄 Finished for pull request ${prNumber}`);
}

run();
