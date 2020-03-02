# NewEraCode Deletion Protection Component

## Description

An [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html) construct that protects the stack from being deleted or a resource from being deleted during update or deployment.

## Usage

### Install

```shell
$ npm i @NewEraCode/cdk-deletion-protection
```
### Import

**NodeJS**
```javascript
const cdp = require('@neweracode/cdk-deletion-protection');
const deletionProtection = new cdp.CDKDeletionProtection(....)
```
**TypeScript / Babel**
```typescript
import { CDKDeletionProtection } from '@neweracode/cdk-deletion-protection';
```

Example:

```typescript
import { UserPool, CfnUserPool } from '@aws-cdk/aws-cognito';
import { CDKDeletionProtection } from '@neweracode/cdk-deletion-protection';

const deletionProtection = new CDKDeletionProtection(this, 'ProtectionPolicies', {
    resourceDeletionPolicy: "RETAIN",
    terminationProtection: true,
});

// enable stack termination deletion protection:
deletionProtection.setStackTerminationProtection(this.stackName);

// protect a Cognito User Pool from getting deleted on update:
const userPool = new UserPool(this, 'cdkUserPool', {...});
const cfnUserPool = userPool.node.defaultChild as CfnUserPool;
deletionProtection.setResourcePolicy(cfnUserPool);
```
