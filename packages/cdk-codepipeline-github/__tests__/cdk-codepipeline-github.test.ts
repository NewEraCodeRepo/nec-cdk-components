import { ResourcePart, SynthUtils } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import { PipelineProject } from '@aws-cdk/aws-codebuild';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { CodeBuildAction, CodeBuildActionType, S3SourceAction } from '@aws-cdk/aws-codepipeline-actions';
import { Bucket } from '@aws-cdk/aws-s3';
import { App, Stack } from '@aws-cdk/core';
import { CdkCodepipelineGithub } from '../src/cdk-codepipeline-github';

describe('cdk-codepipeline-github', () => {
  test('gets status from pipeline', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');

    const sourceBucket = new Bucket(stack, 'MyBucket');

    const pipeline = new Pipeline(stack, 'Pipeline', {
      restartExecutionOnUpdate: true,
    });
    const sourceOutput = new Artifact();
    const sourceAction = new S3SourceAction({
      actionName: 'S3Source',
      bucket: sourceBucket,
      bucketKey: 'path/to/file.zip',
      output: sourceOutput,
    });
    pipeline.addStage({
      actions: [sourceAction],
      stageName: 'Source',
    });
    const project = new PipelineProject(stack, 'MyProject');

    const testAction = new CodeBuildAction({
      actionName: 'IntegrationTest',
      input: sourceOutput,
      project,
      type: CodeBuildActionType.TEST,
    });

    // source stage
    pipeline.addStage({
      actions: [testAction],
      stageName: 'Test',
    });

    // tslint:disable-next-line: no-unused-expression
    new CdkCodepipelineGithub(stack, 'GithubCodepipeline', {
      gitHubSecretArn: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:TOKENS/PIPELINE/GithubToken-76jMu0',
      pipeline,
    });

    expect(stack).toHaveResourceLike(
      'AWS::Events::Rule',
      {
        EventPattern: {
          detail: {
            state: ['STARTED', 'SUCCEEDED', 'FAILED'],
          },
          'detail-type': ['CodePipeline Pipeline Execution State Change'],
          resources: [
            {
              'Fn::Join': [
                '',
                [
                  'arn:',
                  {
                    Ref: 'AWS::Partition',
                  },
                  ':codepipeline:',
                  {
                    Ref: 'AWS::Region',
                  },
                  ':',
                  {
                    Ref: 'AWS::AccountId',
                  },
                  ':',
                  {
                    Ref: 'PipelineC660917D',
                  },
                ],
              ],
            },
          ],
          source: ['aws.codepipeline'],
        },
      },
      ResourcePart.Properties,
    );
  });

  test('gets status from stage', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');

    const sourceBucket = new Bucket(stack, 'MyBucket');

    const pipeline = new Pipeline(stack, 'Pipeline', {
      restartExecutionOnUpdate: true,
    });
    const sourceOutput = new Artifact();
    const sourceAction = new S3SourceAction({
      actionName: 'S3Source',
      bucket: sourceBucket,
      bucketKey: 'path/to/file.zip',
      output: sourceOutput,
    });
    pipeline.addStage({
      actions: [sourceAction],
      stageName: 'Source',
    });
    const project = new PipelineProject(stack, 'MyProject');

    const testAction = new CodeBuildAction({
      actionName: 'IntegrationTest',
      input: sourceOutput,
      project,
      type: CodeBuildActionType.TEST,
    });

    // source stage
    const stage = pipeline.addStage({
      actions: [testAction],
      stageName: 'Test',
    });
    // tslint:disable-next-line: no-unused-expression
    new CdkCodepipelineGithub(stack, 'GithubCodepipeline', {
      gitHubSecretArn: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:TOKENS/PIPELINE/GithubToken-76jMu0',
      stage,
    });

    expect(stack).toHaveResourceLike(
      'AWS::Events::Rule',
      {
        EventPattern: {
          detail: {
            stage: ['Test'],
            state: ['STARTED', 'SUCCEEDED', 'FAILED'],
          },
          'detail-type': ['CodePipeline Stage Execution State Change'],
          resources: [
            {
              'Fn::Join': [
                '',
                [
                  'arn:',
                  {
                    Ref: 'AWS::Partition',
                  },
                  ':codepipeline:',
                  {
                    Ref: 'AWS::Region',
                  },
                  ':',
                  {
                    Ref: 'AWS::AccountId',
                  },
                  ':',
                  {
                    Ref: 'PipelineC660917D',
                  },
                ],
              ],
            },
          ],
          source: ['aws.codepipeline'],
        },
      },
      ResourcePart.Properties,
    );
  });

  test('throws error if no pipeline or stage is provided', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');

    try {
      // tslint:disable-next-line: no-unused-expression
      new CdkCodepipelineGithub(stack, 'GithubCodepipeline', {
        gitHubSecretArn: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:TOKENS/PIPELINE/GithubToken-76jMu0',
      });
      SynthUtils.synthesize(stack);
    } catch (e) {
      expect(e).toStrictEqual(Error('Choose a pipeline or stage to send event status messages from'));
    }
  });
});
