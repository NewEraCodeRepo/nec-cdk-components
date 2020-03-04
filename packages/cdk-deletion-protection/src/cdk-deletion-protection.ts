#!/usr/bin/env node
import { CfnDeletionPolicy, CfnResource, Construct } from '@aws-cdk/core';
import { AwsCustomResource } from '@aws-cdk/custom-resources';

export interface ICDKDeletionProtectionProps {
  resourceDeletionPolicy?: string; // "DELETE" | "RETAIN" | "SNAPSHOT"
  terminationProtection?: boolean;
}

/**
 * DeletionProtection
 *
 * Example usage:
 *
 * const deletionProtection = new CDKDeletionProtection(this, 'ProtectionPolicies', {
 *    resourceDeletionPolicy: "RETAIN",
 *    terminationProtection: true,
 * });
 *
 * // enable stack termination deletion protection:
 * deletionProtection.setStackTerminationProtection(this.stackName);
 *
 * // protect a Cognito User Pool from getting deleted on update:
 * const userPool = new UserPool(this, 'cdkUserPool', {...});
 * const cfnUserPool = userPool.node.defaultChild as CfnUserPool;
 * deletionProtection.setResourcePolicy(cfnUserPool);
 */
export class CDKDeletionProtection extends Construct {
  public setResourcePolicy: (cfnResource: CfnResource) => void;
  public setStackTerminationProtection: (stackName: string) => void;
  constructor(scope: Construct, id: string, props?: ICDKDeletionProtectionProps) {
    super(scope, id);

    this.setResourcePolicy = (cfnResource: CfnResource) => {
      if (props && props.hasOwnProperty('resourceDeletionPolicy')) {
        switch (props.resourceDeletionPolicy) {
          case 'DELETE':
            cfnResource.cfnOptions.updateReplacePolicy = CfnDeletionPolicy.DELETE;
            cfnResource.cfnOptions.deletionPolicy = CfnDeletionPolicy.DELETE;
            break;
          case 'RETAIN':
            cfnResource.cfnOptions.updateReplacePolicy = CfnDeletionPolicy.RETAIN;
            cfnResource.cfnOptions.deletionPolicy = CfnDeletionPolicy.RETAIN;
            break;
          case 'SNAPSHOT':
            cfnResource.cfnOptions.updateReplacePolicy = CfnDeletionPolicy.SNAPSHOT;
            cfnResource.cfnOptions.deletionPolicy = CfnDeletionPolicy.SNAPSHOT;
            break;
          default:
            cfnResource.cfnOptions.updateReplacePolicy = CfnDeletionPolicy.RETAIN;
            cfnResource.cfnOptions.deletionPolicy = CfnDeletionPolicy.RETAIN;
            break;
        }
      } else {
        throw new Error('Resource deletion policy required.');
      }
    };

    this.setStackTerminationProtection = (stackName: string) => {
      if (props && props.hasOwnProperty('terminationProtection')) {
        // Enable stack termination protection
        // using the AWS SDK CloudFormation updateTerminationProtection API:
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#updateTerminationProtection-property

        // tslint:disable-next-line:no-unused-expression
        new AwsCustomResource(this, 'UpdateTerminationProtection', {
          onUpdate: {
            action: 'updateTerminationProtection',
            parameters: {
              EnableTerminationProtection: props.terminationProtection,
              StackName: stackName,
            },
            service: 'CloudFormation',
          },
        });
      } else {
        throw Error('Termination protection option must be set to true or false.');
      }
    };
  }
}
