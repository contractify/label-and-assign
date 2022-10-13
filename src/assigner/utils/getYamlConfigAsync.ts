import yaml from "js-yaml";
import * as core from "@actions/core";

import * as common from "../../common/common";
import * as helpers from "../../common/helpers";

export async function getYamlConfigAsync<TConfig>(
  client: common.ClientType,
  configurationPath: string
): Promise<TConfig | null> {
  try {
    const configurationContent: string = await helpers.fetchContent(
      client,
      configurationPath
    );
    core.debug(configurationContent);

    return yaml.load(configurationContent, {
      filename: configurationPath,
    }) as TConfig;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to load configuration: ${error.message} ${configurationPath}`
      );
    }
    return null;
  }
}
