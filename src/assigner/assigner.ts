import * as core from "@actions/core";
import * as github from "@actions/github";

import { getYamlConfigAsync } from "./utils/getYamlConfigAsync";
import { parseConfig } from "./utils/parseConfig";
import { getContextPullRequestDetails } from "./utils/getContextPullRequestDetails";
import { assignReviewersAsync } from "./utils/assignReviewersAsync";

import * as common from "../common/common";

import { Config } from "./config";

export async function runAssigner(
  client: common.ClientType,
  configPath: string
): Promise<void> {
  try {
    const unassignIfLabelRemoved = core.getInput("unassign-if-label-removed", {
      required: false,
    });

    const contextDetails = await getContextPullRequestDetails(client);
    if (contextDetails == null) {
      throw new Error("No context details");
    }

    let userConfig: Config | null;

    core.debug(`Retrieving config from ${configPath}`);
    userConfig = await getYamlConfigAsync<Config>(client, configPath);
    if (userConfig == null) {
      throw new Error("Failed to load config file");
    }

    core.debug(`Using config - ${JSON.stringify(userConfig)}`);

    const config = parseConfig(userConfig);

    const contextPayload = github.context.payload;

    core.debug("Assigning reviewers...");

    const assignedResult = await assignReviewersAsync({
      client,
      contextDetails,
      contextPayload,
      labelReviewers: config.assign,
    });

    if (assignedResult.status === "error") {
      core.setFailed(assignedResult.message);
      return;
    }

    core.info(`📄 ${assignedResult.message}`);
    if (assignedResult.data) {
      for (const reviewer of assignedResult.data?.reviewers) {
        core.info(` 📄 Assigning reviewer: ${reviewer}`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}
