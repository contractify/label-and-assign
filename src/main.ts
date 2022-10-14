import * as core from "@actions/core";
import * as github from "@actions/github";

import * as common from "./common/common";
import * as helpers from "./common/helpers";
import { runLabeler } from "./labeler/labeler";
import { runAssigner } from "./assigner/assigner";
import { runOwner } from "./owner/owner";

export async function run() {
  core.info(JSON.stringify(github.context));

  const prNumber = helpers.getPrNumber();
  if (!prNumber) {
    console.log("Could not get pull request number from context, exiting");
    return;
  }

  const token = core.getInput("token", { required: true });
  const configPath = core.getInput("configuration-path", { required: true });
  const client: common.ClientType = github.getOctokit(token);

  core.info(`📄 Pull Request Number: ${prNumber}`);

  await runLabeler(client, configPath, prNumber);
  await runAssigner(client, configPath);
  await runOwner(client, prNumber);
}

run();
