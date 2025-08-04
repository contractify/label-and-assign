import { ZodError } from "zod/v3";
import { Config, ConfigSchema } from "../config";

export function parseConfig(config: unknown): Config {
  try {
    if (ConfigSchema.parse(config)) {
      const parsedConfig = config as Config;
      parsedConfig.assign = dedupeLabelReviewers({ ...parsedConfig.assign });
      return parsedConfig;
    }
    return config as Config;
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = error as ZodError<typeof ConfigSchema>;
      throw new Error(validationError.errors[0].message);
    }
    throw new Error("Failed to parse the config");
  }
}

function dedupeLabelReviewers(assign: Config["assign"]): Config["assign"] {
  return Object.keys(assign).reduce<Config["assign"]>((parsed, label) => {
    parsed[label] = [...new Set(assign[label])];
    return parsed;
  }, {});
}
