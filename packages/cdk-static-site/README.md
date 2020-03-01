# NewEraCode Static Website Component

## Description

An [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html) construct that creates static site infrastructure, which uses an S3 bucket for the content.

The site redirects from HTTP to HTTPS, using a CloudFront distribution,
Route53 alias record, and ACM certificate.

The ACM certificate is expected to be created and validated outside of the CDK,
with the certificate ARN stored in an SSM Parameter.

## Usage

### Install

```bash
npm i @NewEraCode/cdk-static-website
```
### Import

**NodeJS**
```javascript
const cds = require('@NewEraCode/cdk-static-site');
new cds.CdkStaticSite(....)
```
**TypeScript / Babel**
```typescript
import { CdkStaticSite } from '@NewEraCode/cdk-static-site';
```

Example:

```typescript
import { App, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { CdkStaticSite } from './cdk-static-site';

export class ComponentStack extends Stack {
    public constructor(parent: App, name: string, props?: StackProps) {
        super(parent, name, props);

        new CdkStaticSite(this, 'StaticWebsite', {
            bucketConfiguration: {
                bucketName: "myBucket",
                removalPolicy: RemovalPolicy.RETAIN,
                websiteIndexDocument: "index.html",
                websiteErrorDocument: "error.html",
                source: "websiteFiles" // local directory with static files
            },
            aliasConfiguration: {
                domainName: "domain.com"
                siteDomain: "example.domain.com",
                acmCertRef: "arn:aws:acm:us-east-1:....."
            },
        });
    }
}
```
