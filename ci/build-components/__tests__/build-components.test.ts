import { ResourcePart } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import { App, Environment, Stack, Tag } from '@aws-cdk/core';
import { BuildComponentsStack } from '../lib/build-components-stack';

describe('cdk-boilerplate', () => {
  test('has a test', () => {
    const env: Environment = {
      account: '123456789012',
      region: 'us-east-1',
    };

    const config = {
      githubConfig: {
        githubBranch: 'develop',
        githubOwner: 'NewEraCode-Holdings',
        githubRepo: 'kh-cdk-components',
      },
      nodeConfig: {
        configProd: 'false',
        logLevel: 'error',
        nodeEnv: 'development',
        yarnProd: 'false',
      },
      secretParams: {
        npmToken: 'testnpmToken',
      },
      secretsManager: {
        githubToken: 'testgithubToken',
      },
    };

    // Stack description
    const description = 'Builds a CI/CD platform that publishes cdk modules to a private npm registry';

    const app = new App();
    const buildComponentsStack = new BuildComponentsStack(app, 'BuildComponentsStack', { config, env, description });
    // tslint:disable-next-line:no-unused-expression
    Tag.add(buildComponentsStack, 'Project', 'CDKComponents');

    expect(buildComponentsStack).toHaveResource('AWS::CodeBuild::Project');
  });
});
