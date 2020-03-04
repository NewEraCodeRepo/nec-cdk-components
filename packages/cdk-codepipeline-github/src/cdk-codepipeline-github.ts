import { IStage, Pipeline } from '@aws-cdk/aws-codepipeline';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { Construct, Duration, SecretValue } from '@aws-cdk/core';
import { join } from 'path';

export interface ICdkCodepipelineGithubProps {
  /**
   * The Codepipeline stage publishing status events
   */
  readonly stage?: IStage;

  /**
   * The Codepipeline publishing status events
   */
  readonly pipeline?: Pipeline;

  /**
   * The arn of a secret in the Secrets Manager with
   * a github token value.
   */
  readonly gitHubSecretArn: string;
}

/**
 * Publishes status events from a stage in Codepipeline
 * to a Github repo using webhooks.
 *
 * SAM template conversion by Julia Jacobs
 * {@see {@link https://github.com/jewelsjacobs}}
 *
 * SAM template created by Jens Eickmeyer
 * {@see {@link https://github.com/jenseickmeyer/github-commit-status-bot}}
 * {@see {@link https://scratchpad.blog/devops/howto/send-commit-status-from-codepipeline-to-github/}}
 *
 * @example <caption>Example usage of construct in pipeline.</caption>
 * // One possible way to get an existing secret's arn - using AwsCustomResource
 * // and AWS SecretsManager SDK
 * const getGithubSecret = new AwsCustomResource(this, 'GetGithubSecret', {
 *   onUpdate: {
 *      service: 'SecretsManager',
 *      action: 'describeSecret',
 *      parameters: {
 *         SecretId: 'TOKENS/PIPELINE/GithubToken' // ID of secret
 *      }
 *   }
 * });
 * // ARN is a property in the describeSecret SDK response
 * const gitHubSecretArn = `${getGithubSecret.getData("ARN")}` as string;
 *
 * // pipeline
 * const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
 *   restartExecutionOnUpdate: true
 * });
 *
 * // source stage
 * pipeline.addStage({
 *   stageName: 'Source',
 *   actions: [sourceAction]
 * });
 *
 * // build stage
 * const buildStage = pipeline.addStage({
 *   stageName: 'Build',
 *   actions: [buildAction]
 * });
 *
 * // Github status checks based on status of the build stage
 * new CdkCodepipelineGithub(this, 'GithubCodepipeline', {
 *   stage: buildStage,
 *   gitHubSecretArn
 * });
 *
 * // deploy stage
 * pipeline.addStage({
 *   stageName: 'Deploy',
 *   actions: [deployAction]
 * });
 *
 * // or check status of pipeline itself:
 * new CdkCodepipelineGithub(this, 'GithubCodepipeline', {
 *   pipeline,
 *   gitHubSecretArn
 * });
 */
export class CdkCodepipelineGithub extends Construct {
  constructor(scope: Construct, id: string, props: ICdkCodepipelineGithubProps) {
    super(scope, id);

    const { stage, pipeline, gitHubSecretArn } = props;

    const statusLambda = new Function(this, 'StatusLambda', {
      code: Code.asset(join(__dirname, '..', 'lambda_packages', 'package.zip')),
      environment: {
        ACCESS_TOKEN: SecretValue.secretsManager(gitHubSecretArn).toString(), // github token passed to Lambda
      },
      handler: 'index.handler',
      runtime: Runtime.NODEJS_10_X,
      timeout: Duration.seconds(300),
    });

    const lambdaTarget = new LambdaFunction(statusLambda);

    if (stage) {
      stage.onStateChange('StageOnStateChange', lambdaTarget, {
        eventPattern: {
          detail: {
            state: ['STARTED', 'SUCCEEDED', 'FAILED'],
          },
        },
      });
    }

    if (pipeline) {
      pipeline.onStateChange('StageOnStateChange', {
        eventPattern: {
          detail: {
            state: ['STARTED', 'SUCCEEDED', 'FAILED'],
          },
        },
        target: lambdaTarget,
      });
    }

    if (!stage && !pipeline) {
      throw Error('Choose a pipeline or stage to send event status messages from');
    }

    statusLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['*'],
        resources: ['*'],
      }),
    );
  }
}
