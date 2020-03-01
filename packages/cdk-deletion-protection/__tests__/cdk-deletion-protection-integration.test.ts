import { App, CfnResource, Environment, Stack } from '@aws-cdk/core';
import 'jest-cdk-snapshot';
// tslint:disable-next-line: no-var-requires
import { CDKDeletionProtection, ICDKDeletionProtectionProps } from '../src/cdk-deletion-protection';

function mockDateNow() {
  return 1566592070148;
}

const originalDateNow = Date.now;

describe('cdk-deletion-protection', () => {
  beforeEach(() => {
    Date.now = mockDateNow;
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  test('snapshot', () => {
    const env: Environment = {
      account: '123456789012',
      region: 'us-east-1',
    };

    const deletionProtectionProps: ICDKDeletionProtectionProps = {
      resourceDeletionPolicy: 'RETAIN',
      terminationProtection: true,
    };

    const app = new App();
    const stack = new Stack(app, 'Test', { env });
    const deletionProtection = new CDKDeletionProtection(
      stack,
      'InvalidCDKDeletionProtection',
      deletionProtectionProps,
    );

    const cnfResource = new CfnResource(stack, 'PolicyResource', {
      type: 'Test::Resource::ValidPolicy',
    });

    deletionProtection.setResourcePolicy(cnfResource);
    deletionProtection.setStackTerminationProtection(stack.stackName);

    expect(stack).toMatchCdkSnapshot();
  });
});
