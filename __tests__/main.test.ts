import { runLabeler } from "../src/labeler/labeler";
import * as github from "@actions/github";

const fs = jest.requireActual("fs");

jest.mock("@actions/core");
jest.mock("@actions/github");

const gh = github.getOctokit("_");
const addLabelsMock = jest.spyOn(gh.rest.issues, "addLabels");
const removeLabelMock = jest.spyOn(gh.rest.issues, "removeLabel");
const reposMock = jest.spyOn(gh.rest.repos, "getContent");
const paginateMock = jest.spyOn(gh, "paginate");

const yamlFixtures = {
  "only_pdfs.yml": fs.readFileSync("__tests__/fixtures/only_pdfs.yml"),
};

afterAll(() => jest.restoreAllMocks());

describe("run", () => {
  it("adds labels to PRs that match our glob patterns", async () => {
    usingLabelerConfigYaml("only_pdfs.yml");
    mockGitHubResponseChangedFiles("foo.pdf");

    await runLabeler(gh, "only_pdfs.yml", 123);

    expect(removeLabelMock).toHaveBeenCalledTimes(0);
    expect(addLabelsMock).toHaveBeenCalledTimes(1);
    expect(addLabelsMock).toHaveBeenCalledWith({
      owner: "monalisa",
      repo: "helloworld",
      issue_number: 123,
      labels: ["touched-a-pdf-file"],
    });
  });

  it("does not add labels to PRs that do not match our glob patterns", async () => {
    usingLabelerConfigYaml("only_pdfs.yml");
    mockGitHubResponseChangedFiles("foo.txt");

    await runLabeler(gh, "only_pdfs.yml", 123);

    expect(removeLabelMock).toHaveBeenCalledTimes(0);
    expect(addLabelsMock).toHaveBeenCalledTimes(0);
  });
});

function usingLabelerConfigYaml(fixtureName: keyof typeof yamlFixtures): void {
  reposMock.mockResolvedValue(<any>{
    data: { content: yamlFixtures[fixtureName], encoding: "utf8" },
  });
}

function mockGitHubResponseChangedFiles(...files: string[]): void {
  const returnValue = files.map((f) => ({ filename: f }));
  paginateMock.mockReturnValue(<any>returnValue);
}
