import * as core from "@actions/core";
import * as github from "@actions/github";

import { runLabeler } from "./labeler";
import * as helpers from "./helpers";
import * as types from "./types";

export async function run() {
  const prNumber = helpers.getPrNumber();
  if (!prNumber) {
    console.log("Could not get pull request number from context, exiting");
    return;
  }

  const token = core.getInput("repo-token", { required: true });
  const configPath = core.getInput("configuration-path", { required: true });
  const client: types.ClientType = github.getOctokit(token);

  await runLabeler(client, configPath, prNumber);
}

run();
