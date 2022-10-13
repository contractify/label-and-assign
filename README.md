# Pull Request Labeler

Automatically label and assign new pull requests based on the paths of files being changed.

🚨🚨🚨 WORK IN PROGRESS 🚨🚨🚨

## Usage

### Create `.github/label-and-assign.yml`

Create a `.github/label-and-assign.yml` file containing:

```yaml
labels:
  dependencies:
  - composer.json
  - composer.lock
  - package.json
  - package-lock.json
  - nova-components/ModuleSelector/package.json
  - nova-components/ModuleSelector/package-lock.json

  gihub_actions:
  - '.github/**/*'

  javascript:
  - ./**/*.vue
  - ./**/*.js

  php:
  - ./**/*.php

assign:
  dependencies:
  - user1
  - user2

  gihub_actions:
  - user1

  php:
  - user2
  - user3

  database:
  - user2
  - user3

  javascript:
  - user4
```

### Sample workflow

```yaml
name: PR Automation

on:
  pull_request:
    types: [opened, ready_for_review, reopened, synchronize]

permissions:
  contents: write
  checks: write
  pull-requests: write

jobs:
  automation:
    runs-on: ubuntu-latest
    steps:
    - name: Assign Labels and Users
      uses: pieterclaerhout/label-and-assign@3015dc69ef33f6b6c0de777e960c3935053b35f7
      if: ${{ !startsWith(github.ref, 'refs/heads/dependabot/') }}
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

<!--
The key is the name of the label in your repository that you want to add (eg: "merge conflict", "needs-updating") and the value is the path (glob) of the changed files (eg: `src/**/*`, `tests/*.spec.js`) or a match object.

#### Match Object

For more control over matching, you can provide a match object instead of a simple path glob. The match object is defined as:

```yml
- any: ['list', 'of', 'globs']
  all: ['list', 'of', 'globs']
```

One or both fields can be provided for fine-grained matching. Unlike the top-level list, the list of path globs provided to `any` and `all` must ALL match against a path for the label to be applied.

The fields are defined as follows:
* `any`: match ALL globs against ANY changed path
* `all`: match ALL globs against ALL changed paths

A simple path glob is the equivalent to `any: ['glob']`. More specifically, the following two configurations are equivalent:
```yml
label1:
- example1/*
```
and
```yml
label1:
- any: ['example1/*']
```

From a boolean logic perspective, top-level match objects are `OR`-ed together and individual match rules within an object are `AND`-ed. Combined with `!` negation, you can write complex matching rules.

#### Basic Examples

```yml
# Add 'label1' to any changes within 'example' folder or any subfolders
label1:
- example/**/*

# Add 'label2' to any file changes within 'example2' folder
label2: example2/*
```

#### Common Examples

```yml
# Add 'repo' label to any root file changes
repo:
- '*'

# Add '@domain/core' label to any change within the 'core' package
@domain/core:
- package/core/*
- package/core/**/*

# Add 'test' label to any change to *.spec.js files within the source dir
test:
- src/**/*.spec.js

# Add 'source' label to any change to src files within the source dir EXCEPT for the docs sub-folder
source:
- any: ['src/**/*', '!src/docs/*']

# Add 'frontend` label to any change to *.js files as long as the `main.js` hasn't changed
frontend:
- any: ['src/**/*.js']
  all: ['!src/main.js']
```

### Create Workflow

Create a workflow (eg: `.github/workflows/labeler.yml` see [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file)) to utilize the labeler action with content:

```yml
name: "Pull Request Labeler"
on:
- pull_request_target

jobs:
  triage:
    permissions:
      contents: read
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
    - uses: actions/labeler@v4
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

_Note: This grants access to the `GITHUB_TOKEN` so the action can make calls to GitHub's rest API_

#### Inputs

Various inputs are defined in [`action.yml`](action.yml) to let you configure the labeler:

| Name | Description | Default |
| - | - | - |
| `repo-token` | Token to use to authorize label changes. Typically the GITHUB_TOKEN secret, with `contents:read` and `pull-requests:write` access | N/A |
| `configuration-path` | The path to the label configuration file | `.github/labeler.yml` |
| `sync-labels` | Whether or not to remove labels when matching files are reverted or no longer changed by the PR | `false`

# Contributions

Contributions are welcome! See the [Contributor's Guide](CONTRIBUTING.md). -->
