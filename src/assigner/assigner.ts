import * as core from "@actions/core";
import * as github from "@actions/github";

import { getYamlConfigAsync } from "./utils/getYamlConfigAsync";
import { parseConfig } from "./utils/parseConfig";
import { assignReviewersAsync } from "./utils/assignReviewersAsync";

import * as common from "../common/common";
import * as helpers from "../common/helpers";

import { Config } from "./config";

export async function runAssigner(
  client: common.ClientType,
  configPath: string,
  prNumber: number
): Promise<void> {
  try {
    const prReviewersAndAssignees = await helpers.getPrReviewersAndAssignees(
      client,
      prNumber
    );
    if (prReviewersAndAssignees === undefined) {
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
      client: client,
      labelReviewers: config.assign,
      contextDetails: prReviewersAndAssignees,
      contextPayload: contextPayload,
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
