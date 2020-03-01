import { App, Environment, RemovalPolicy, Stack } from '@aws-cdk/core';
import 'jest-cdk-snapshot';
import mock from 'mock-fs';
import { join } from 'path';
// tslint:disable-next-line: no-var-requires
import { CdkStaticSite } from '../src/cdk-static-site';
jest.mock('@aws-cdk/aws-s3-deployment');

const dirPath = join(__dirname, 'websiteFiles');

describe('cdk-static-site', () => {
  beforeEach(() => {
    mock(
      {
        dirPath: mock.directory({
          items: {
            'error.html': '<html><body><h1>Bye!</h1></body></html>',
            'index.html': '<html><body><h1>Hi!</h1></body></html>',
          },
          mode: '0755',
        }),
      },
      { createCwd: false, createTmp: false },
    );
  });

  test('snapshot', () => {
    const env: Environment = {
      account: '123456789012',
      region: 'us-east-1',
    };

    const app = new App();
    const stack = new Stack(app, 'Test', { env });

    // tslint:disable-next-line: no-unused-expression
    new CdkStaticSite(stack, 'StaticWebsite', {
      aliasConfiguration: {
        acmCertRef: 'arn:aws:acm:us-east-1:123456789012:certificate/955290e7-e7e5-47b1-9077-b84e7dc1747a',
        domainName: 'domain.com',
        siteDomain: 'example.domain.com',
      },
      bucketConfiguration: {
        bucketName: 'test-bucket',
        removalPolicy: RemovalPolicy.RETAIN,
        source: dirPath,
        websiteErrorDocument: 'error.html',
        websiteIndexDocument: 'index.html',
      },
    });
    mock.restore();
    expect(stack).toMatchCdkSnapshot();
  });
});
