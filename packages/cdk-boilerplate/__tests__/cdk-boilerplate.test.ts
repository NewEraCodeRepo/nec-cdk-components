import { ResourcePart } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import { App, Stack } from '@aws-cdk/core';
import { CDKBoilerplate, ICDKBoilerplateProps } from '../src/cdk-boilerplate';

describe('cdk-boilerplate', () => {
  test('has a test', () => {
    const boilerplateProps: ICDKBoilerplateProps = {
      bucketName: 'test-bucket',
    };

    const app = new App();
    const stack = new Stack(app, 'Test');
    // tslint:disable-next-line:no-unused-expression
    new CDKBoilerplate(stack, 'Boilerplate', boilerplateProps);

    expect(stack).toHaveResource('AWS::S3::Bucket');
  });
});
