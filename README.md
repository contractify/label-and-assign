# Pull Request Label and Assign

Add [Contractify](https://contractify.io), we like to keeps things nice, tidy and
organized. We are using [Jira](https://www.atlassian.com/nl/software/jira) for
our issue management and [GitHub](https://www.github.com) for our version control.

Since we are keen on reducing the manual work related to pull requests, we
created a [GitHub action](https://github.com/features/actions) that helps us in
assigning labels, reviewers and owners to a pull request, based on the files
changed in the pull request.

The current version allows you to:

- Assign labels based on file patterns
- Assign reviewers based on labels
- Assign the sender of the pull request as the owner (we don't like pull
  requests which are owned by nobody)

## Sample action setup

To get started, you will need to create a GitHub action workflow file. If you
need more information on how to set that up, check
[here](https://docs.github.com/en/actions/quickstart).

In our repositories, we keep these actions in a separate workflow, so we usually
add a file called `.github/workflows/automation.yml` to our repository and put
the following content in there:

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

This file contains the mapping of the labels against the file patterns and the
reviewers based on the labels.

### Create the workflow file

You will need to create a GitHub action workflow file. If you
need more information on how to set that up, check
[here](https://docs.github.com/en/actions/quickstart).

In our repositories, we keep these actions in a separate workflow, so we usually
add a file called `.github/workflows/automation.yml` to our repository and put
the following content in there:


```yaml
name: PR Automation

on:
  [ push ]

permissions:
  contents: write
  checks: write
  pull-requests: write

jobs:
  automation:
    runs-on: ubuntu-latest
    steps:
    - name: Assign Labels and Users
      uses: contractify/label-and-assign@v2.1.0
      if: ${{ github.actor != 'dependabot[bot]' }}
      with:
        token: "${{ secrets.GITHUB_TOKEN }}"
```

## Inputs

Various inputs are defined in [`action.yml`](action.yml) to let you configure the actions:

| Name | Description | Default |
| - | - | - |
| `token` | Token to use to authorize label changes. Typically the GITHUB_TOKEN secret, with `contents:read` and `pull-requests:write` access | N/A |
| `configuration-path` | The path to the label configuration file | `.github/labeler.yml` |

## In Detail

### Order of the actions

The action always runs the steps in the following order:

1. Detect which files are changed
2. Assign the labels based on the changed files
3. Assign the reviewers based on the labels
4. Assign the owner if not present yet

### Detection of the changed files

You might notice that there is no `checkout` step in the workflow. This is done
on purpose as the list of changed files is extracted from the pull request
details using the GitHub API. This is much faster than having to do a full
checkout of your repository.

## About Contractify

Contractify is a blooming Belgian SaaS scale-up offering contract management software and services.

We help business leaders, legal & finance teams to
- 🗄️ centralize contracts & responsibilities, even in a decentralized organization.
- 📝 keep track of all contracts & related mails or documents in 1 tool
- 🔔 automate & collaborate on contract follow-up tasks
- ✒️ approve & sign documents safely & fast
- 📊 report on custom contract data

The cloud platform is easily supplemented with full contract management support, including:
- ✔️ registration and follow up of your existing & new contracts
- ✔️ expert advice on contract management
- ✔️ periodic reporting & status updates

Start automating your contract management for free with Contractify on:
https://info.contractify.io/free-trial
