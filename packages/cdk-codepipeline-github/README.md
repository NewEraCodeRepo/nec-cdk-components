# NewEraCode CDK Codepipeline-Github

## Description

An [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html) construct that publishes status events from a stage in Codepipeline
to a Github repo using webhooks

## Setup with Github

A github token is required for this module. It needs to be imported into the secrets manager.

Here is an example of how to import it using the aws sdk cli:

```
aws secretsmanager create-secret --name "TOKENS/PIPELINE/GithubToken" --description "Github Token" --secret-string <token_value>
```

Should the stage be a Codebuild Project, make sure the github token gets imported to CodeBuild:

```
aws codebuild import-source-credentials --server-type GITHUB --auth-type PERSONAL_ACCESS_TOKEN --token <token_value>
```

## Usage

### Install

```bash
$ npm i @NewEraCode/cdk-codepipeline-github
```
### Import

**NodeJS**
```javascript
const ccg = require('@NewEraCode/cdk-codepipeline-github');
new ccg.CdkCodepipelineGithub(.....)
```
**TypeScript / Babel**
```typescript
import { CdkCodepipelineGithub } from '@NewEraCode/cdk-codepipeline-github';
```

### Example
```typescript
// One possible way to get an existing secret's arn - using AwsCustomResource
// and AWS SecretsManager SDK
import { AwsCustomResource } from '@aws-cdk/custom-resources';
import { CdkCodepipelineGithub } from '@NewEraCode/cdk-codepipeline-github';
import { Pipeline } = require('@aws-cdk/aws-codepipeline');

const getGithubSecret = new AwsCustomResource(this, 'GetGithubSecret', {
  onUpdate: {
     service: 'SecretsManager',
     action: 'describeSecret',
     parameters: {
        SecretId: 'TOKENS/PIPELINE/GithubToken' // ID of secret
     },
     physicalResourceId: Date.now().toString()
  }
});
// ARN is a property in the describeSecret SDK response
const gitHubSecretArn = `${getGithubSecret.getData("ARN")}` as string;

// pipeline
const pipeline = new Pipeline(this, 'Pipeline', {
  restartExecutionOnUpdate: true
});

// source stage
pipeline.addStage({
  stageName: 'Source',
  actions: [sourceAction]

// build stage
const buildStage = pipeline.addStage({
  stageName: 'Build',
  actions: [buildAction]
});

// Github status checks based on status of the build stage
new CdkCodepipelineGithub(this, 'GithubCodepipeline', {
  stage: buildStage,
  gitHubSecretArn
});

// deploy stage
pipeline.addStage({
  stageName: 'Deploy',
  actions: [deployAction]
});

// or check status of pipeline itself:
new CdkCodepipelineGithub(this, 'GithubCodepipeline', {
  pipeline,
  gitHubSecretArn
});
```
