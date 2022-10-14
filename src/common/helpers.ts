import * as github from "@actions/github";
import * as core from "@actions/core";
import * as common from "./common";

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

export function getPrNumber(): number | undefined {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return undefined;
  }

  core.info(JSON.stringify(github.context));

  return pullRequest.number;
}

export async function getChangedFiles(
  client: common.ClientType,
  prNumber: number
): Promise<string[]> {
  const listFilesOptions = client.rest.pulls.listFiles.endpoint.merge({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
  });

  const listFilesResponse = await client.paginate(listFilesOptions);
  const changedFiles = listFilesResponse.map((f: any) => f.filename);

  if (changedFiles.length > 0) {
    core.info("📄 Changed files");
    for (const file of changedFiles) {
      core.info(`  📄 Changed file: ${file}`);
    }
  }

  return changedFiles;
}
