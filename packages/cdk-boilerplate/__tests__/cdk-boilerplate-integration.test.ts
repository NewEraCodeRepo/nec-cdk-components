import { App, Environment, Stack } from '@aws-cdk/core';
import 'jest-cdk-snapshot';
import { CDKBoilerplate, ICDKBoilerplateProps } from '../src/cdk-boilerplate';

describe('cdk-deletion-protection', () => {
  test('snapshot', () => {
    const env: Environment = {
      account: '123456789012',
      region: 'us-east-1',
    };

    const boilerplateProps: ICDKBoilerplateProps = {
      bucketName: 'test-bucket',
    };

    const app = new App();
    const stack = new Stack(app, 'Test', { env });
    // tslint:disable-next-line:no-unused-expression
    new CDKBoilerplate(stack, 'Boilerplate', boilerplateProps);

    expect(stack).toMatchCdkSnapshot();
  });
});
