/* tslint:disable:no-unused-expression */
import codebuild = require('@aws-cdk/aws-codebuild');
import ssm = require('@aws-cdk/aws-ssm');
import cdk = require('@aws-cdk/core');
import { IConfig } from '../../../scripts/config';

export interface IBuildComponentsStackProps extends cdk.StackProps {
  config: IConfig;
}

export class BuildComponentsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: IBuildComponentsStackProps) {
    super(scope, id, props);

    const {
      githubConfig: { githubOwner, githubRepo, githubBranch },
    } = props.config;

    const gitHubSource = codebuild.Source.gitHub({
      owner: githubOwner,
      repo: githubRepo,
      webhook: true, // optional, default: true if `webhookFilteres` were provided, false otherwise
      webhookFilters: [codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs(githubBranch)], // optional, by default all pushes and Pull Requests will trigger a build
    });

    const secureNpmToken = ssm.StringParameter.fromSecureStringParameterAttributes(this, 'SecureNpmToken', {
      parameterName: '/TOKENS/CODEBUILD/ReadWriteNpmToken',
      version: 1,
    });

    const componentBuildProject = new codebuild.Project(this, 'ComponentBuildProject', {
      badge: true,
      description: 'NewEraCode Component CodeBuild Project',
      environmentVariables: {
        NODE_ENV: { value: 'development' },
        NODE_OPTIONS: { value: '--max-old-space-size=4096' },
        NPM_CONFIG_LOGLEVEL: { value: 'error' },
        NPM_CONFIG_PRODUCTION: { value: 'false' },
        NPM_TOKEN: {
          type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
          value: '/TOKENS/CODEBUILD/ReadWriteNpmToken',
        },
        YARN_PRODUCTION: { value: 'false' },
      },
      projectName: 'CDKComponents',
      source: gitHubSource,
    });

    secureNpmToken.grantRead(componentBuildProject);
  }
}
