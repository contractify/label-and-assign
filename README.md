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

#### Inputs

Various inputs are defined in [`action.yml`](action.yml) to let you configure the labeler:

| Name | Description | Default |
| - | - | - |
| `token` | Token to use to authorize label changes. Typically the GITHUB_TOKEN secret, with `contents:read` and `pull-requests:write` access | N/A |
| `configuration-path` | The path to the label configuration file | `.github/labeler.yml` |
