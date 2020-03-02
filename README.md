# New Era Code CDK Components and Modules

<!-- ![Build Status](https://codebuild.us-east-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiVlo4VDRoMmNvZzJ4NkliN3ZaN3J6YlBrKzJMdzNQalljTG9qNGZRODd1dmxMN0E0cEtJMU1vU254cCtHZXlGWnkvZERnQTRxd0FYTkE0NGlwcEZITW4wPSIsIml2UGFyYW1ldGVyU3BlYyI6IlNLTTFpRVhaazd4TGJiL28iLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master) -->

| name                                                                  | description                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------- |
| [cdk-codepipeline-github](packages/cdk-codepipeline-github/README.md) | Sends codbuild and codepipeline status events to github |
| [cdk-static-site](packages/cdk-static-site/README.md)                 | Creates static site infrastructure                      |
| [cdk-deletion-protection](packages/cdk-deletion-protection/README.md) | Protects infrastructure from deletion                   |

This repo tests, and packages different modules into npm mods which can be used in other New Era Code applications

Uses:

- [TypeScript](https://www.typescriptlang.org/)
- [Lerna](https://lerna.js.org/)
- [Jest](https://jestjs.io/)
- [Lerna Script](https://github.com/wix/lerna-script)
- [TSlint](https://palantir.github.io/tslint/)
- [Eslint](https://eslint.org)
- [AWS Cloud Development Kit](https://docs.aws.amazon.com/cdk/latest/guide/home.html) - Software development framework for defining your cloud infrastructure in code and provisioning it through AWS CloudFormation.

## Setup

### Prerequisites

- Node.js (>= 8.11.x)
- Installed globally:

```bash
$ npm install -g lerna aws-cdk typescript
```

#### Optional utilities

There are some optional handy lerna tools:

- [Lerna Wizard](https://github.com/webuniverseio/lerna-wizard)
- [Lerna Update Wizard](https://github.com/Anifacted/lerna-update-wizard) - make sure to install this globally, it doesn't work as a devDependancy.

```bash
$ npm install -g lerna-wizard lerna-update-wizard
```

Make sure not to commit any sensative files:

- [Git secrets](https://github.com/awslabs/git-secrets)

### AWS Credentials

[AWS authentication](docs/aws.md)

### Environment Variables

Copy the `sample.env` file and rename it / place it in the root as `.env`.

### Local

**Build:**

```bash
$ npm install
$ npm run setup
$ npm run build
```

#### Test

```bash
$ npm run test
```

#### Update NPM Modules

To make sure the npm modules from external libraries
are up to date in all of the packages, run:

```bash
$ npm run update
```

#### Creating a new CDK Module

1. Run the following commands:

```bash
$ lerna create @neweracode/cdk-<name-of-package> packages
```
for example:

```bash
$ lerna create @neweracode/cdk-deletion-protection packages
```

1. Answer questions. Look at the package.json files in the other modules for sample information.
2. Copy files from cdk-boilerplate folder
3. Change EVERYTHING that has the string `cdk-boilerplate` (including filenames) and `CDKBoilerplate` (incuding classes) to match the name of your package.
4. Modify files for your library / module

#### Version / Pack / Publish

- When the code is committed to the repo a git pre-push hook versions the changed modules automatically.
- When the code is pushed, the ci process will pack and publish the modules.

For this process to occur, the codebuild stack in the ci package must have already been deployed and working. See CI setup below for more information.

### CI setup

[CDK deployment](docs/cdk.md)
