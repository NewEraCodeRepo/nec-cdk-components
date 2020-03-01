import { App, Environment, Stack, Tag } from '@aws-cdk/core';
import 'jest-cdk-snapshot';
import { BuildComponentsStack } from '../lib/build-components-stack';

describe('cdk-deletion-protection', () => {
  test('snapshot', () => {
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
    // Add a tag to all constructs in the stack
    Tag.add(buildComponentsStack, 'Project', 'CDKComponents');

    expect(buildComponentsStack).toMatchCdkSnapshot();
  });
});
