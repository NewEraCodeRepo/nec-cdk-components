import { ResourcePart, SynthUtils } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import { App, CfnResource, Stack } from '@aws-cdk/core';
// tslint:disable-next-line: no-var-requires
import { CDKDeletionProtection, ICDKDeletionProtectionProps } from '../src/cdk-deletion-protection';

describe('cdk-deletion-protection resource policy', () => {
  test('sets retain by default', () => {
    const invalidResourceDeletion: ICDKDeletionProtectionProps = {
      resourceDeletionPolicy: 'INVALIDPOLICY',
    };

    const app = new App();
    const stack = new Stack(app, 'Test');
    const inValidDeletionProtection = new CDKDeletionProtection(
      stack,
      'InvalidCDKDeletionProtection',
      invalidResourceDeletion,
    );

    const invalidCnfResource = new CfnResource(stack, 'InvalidPolicyResource', {
      type: 'Test::Resource::InvalidPolicy',
    });

    inValidDeletionProtection.setResourcePolicy(invalidCnfResource);

    expect(stack).toHaveResource(
      'Test::Resource::InvalidPolicy',
      {
        DeletionPolicy: 'Retain',
        UpdateReplacePolicy: 'Retain',
      },
      ResourcePart.CompleteDefinition,
    );
  });

  test('sets to delete', () => {
    const deletionProtectionProps: ICDKDeletionProtectionProps = {
      resourceDeletionPolicy: 'DELETE',
    };

    const app = new App();
    const stack = new Stack(app, 'Test');
    const deletionProtection = new CDKDeletionProtection(
      stack,
      'InvalidCDKDeletionProtection',
      deletionProtectionProps,
    );
    const cnfResource = new CfnResource(stack, 'DeleteResource', {
      type: 'Test::Resource::Delete',
    });

    deletionProtection.setResourcePolicy(cnfResource);

    expect(stack).toHaveResource(
      'Test::Resource::Delete',
      {
        DeletionPolicy: 'Delete',
        UpdateReplacePolicy: 'Delete',
      },
      ResourcePart.CompleteDefinition,
    );
  });

  test('sets to snapshot', () => {
    const deletionProtectionPropsWithSnapshot: ICDKDeletionProtectionProps = {
      resourceDeletionPolicy: 'SNAPSHOT',
    };

    const app = new App();
    const stack = new Stack(app, 'Test');
    const deletionProtectionWithSnapshot = new CDKDeletionProtection(
      stack,
      'SnapshotCDKDeletionProtection',
      deletionProtectionPropsWithSnapshot,
    );
    const cnfSnapshotResource = new CfnResource(stack, 'SnapshotResource', {
      type: 'Test::Resource::Snapshot',
    });

    deletionProtectionWithSnapshot.setResourcePolicy(cnfSnapshotResource);

    expect(stack).toHaveResource(
      'Test::Resource::Snapshot',
      {
        DeletionPolicy: 'Snapshot',
        UpdateReplacePolicy: 'Snapshot',
      },
      ResourcePart.CompleteDefinition,
    );
  });

  test('throws error if missing policy', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const deletionProtectionEmpty = new CDKDeletionProtection(stack, 'EmptyCDKDeletionProtection');
    const cnfEmptyResource = new CfnResource(stack, 'EmptyResource', {
      type: 'Test::Resource::Empty',
    });

    try {
      deletionProtectionEmpty.setResourcePolicy(cnfEmptyResource);
      SynthUtils.synthesize(stack);
    } catch (e) {
      expect(e).toStrictEqual(new Error('Resource deletion policy required.'));
    }
  });
});

describe('cdk-deletion-protection stack termination protection', () => {
  test('will throw an error if terminationProtection is not set', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const noTermSet = new CDKDeletionProtection(stack, 'noTermSet');

    try {
      noTermSet.setStackTerminationProtection(stack.stackName);
      SynthUtils.synthesize(stack);
    } catch (e) {
      expect(e).toStrictEqual(new Error('Termination protection option must be set to true or false.'));
    }
  });

  test('will update the termination protection of the stack tp true', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const termSet = new CDKDeletionProtection(stack, 'TermSet', {
      terminationProtection: true,
    });

    termSet.setStackTerminationProtection(stack.stackName);
    expect(SynthUtils.synthesize(stack)).toHaveResourceLike(
      'AWS::IAM::Policy',
      {
        PolicyDocument: {
          Statement: [
            {
              Action: 'cloudformation:UpdateTerminationProtection',
              Effect: 'Allow',
              Resource: '*',
            },
          ],
          Version: '2012-10-17',
        },
      },
      ResourcePart.Properties,
    );

    expect(SynthUtils.synthesize(stack)).toHaveResourceLike(
      'Custom::AWS',
      {
        Create: {
          action: 'updateTerminationProtection',
          parameters: {
            EnableTerminationProtection: 'TRUE:BOOLEAN',
            StackName: 'Test',
          },
          service: 'CloudFormation',
        },
        Update: {
          action: 'updateTerminationProtection',
          parameters: {
            EnableTerminationProtection: 'TRUE:BOOLEAN',
            StackName: 'Test',
          },
          service: 'CloudFormation',
        },
      },
      ResourcePart.Properties,
    );
  });

  test('will update the termination protection of the stack to false', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const termSet = new CDKDeletionProtection(stack, 'TermSet', {
      terminationProtection: false,
    });

    termSet.setStackTerminationProtection(stack.stackName);
    expect(SynthUtils.synthesize(stack)).toHaveResourceLike(
      'AWS::IAM::Policy',
      {
        PolicyDocument: {
          Statement: [
            {
              Action: 'cloudformation:UpdateTerminationProtection',
              Effect: 'Allow',
              Resource: '*',
            },
          ],
          Version: '2012-10-17',
        },
      },
      ResourcePart.Properties,
    );

    expect(SynthUtils.synthesize(stack)).toHaveResourceLike(
      'Custom::AWS',
      {
        Create: {
          action: 'updateTerminationProtection',
          parameters: {
            EnableTerminationProtection: 'FALSE:BOOLEAN',
            StackName: 'Test',
          },
          service: 'CloudFormation',
        },
        Update: {
          action: 'updateTerminationProtection',
          parameters: {
            EnableTerminationProtection: 'FALSE:BOOLEAN',
            StackName: 'Test',
          },
          service: 'CloudFormation',
        },
      },
      ResourcePart.Properties,
    );
  });
});
