#!/usr/bin/env node
/* tslint:disable */
import { CloudFrontWebDistribution, SecurityPolicyProtocol, SSLMethod } from '@aws-cdk/aws-cloudfront';
import { HostedZone, ARecord, RecordTarget } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets/lib';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Construct, RemovalPolicy } from '@aws-cdk/core';
import * as path from 'path';

export interface CdkStaticSiteProps {
  bucketConfiguration: {
    bucketName: string;
    removalPolicy: RemovalPolicy;
    websiteIndexDocument: string;
    websiteErrorDocument: string;
    source: string;
  };
  aliasConfiguration: {
    domainName: string;
    siteDomain: string;
    acmCertRef: string;
  };
}

/**
 * Static site infrastructure, using an S3 bucket for the content.
 *
 * The site redirects from HTTP to HTTPS, using a CloudFront distribution,
 * Route53 alias record, and ACM certificate.
 *
 * The ACM certificate is expected to be created and validated outside of the CDK,
 * with the certificate ARN stored in an SSM Parameter.
 */
export class CdkStaticSite extends Construct {
  constructor(parent: Construct, name: string, props: CdkStaticSiteProps) {
    super(parent, name);

    const { bucketName, removalPolicy, websiteIndexDocument, websiteErrorDocument, source } = props.bucketConfiguration;
    const { domainName, siteDomain, acmCertRef } = props.aliasConfiguration;

    // Content bucket
    const siteBucket = new Bucket(this, 'SiteBucket', {
      bucketName,
      publicReadAccess: true,
      // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
      // the new bucket, and it will remain in your account until manually deleted. By setting the policy to
      // DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
      removalPolicy, // DESTROY NOT recommended for production code
      websiteErrorDocument,
      websiteIndexDocument,
    });

    // CloudFront distribution that provides HTTPS
    const distribution = new CloudFrontWebDistribution(this, 'SiteDistribution', {
      aliasConfiguration: {
        acmCertRef,
        names: [siteDomain],
        securityPolicy: SecurityPolicyProtocol.TLS_V1_1_2016,
        sslMethod: SSLMethod.SNI,
      },
      defaultRootObject: websiteIndexDocument,
      originConfigs: [
        {
          behaviors: [{ isDefaultBehavior: true }],
          s3OriginSource: {
            s3BucketSource: siteBucket,
          },
        },
      ],
    });

    const placeHolderSource = path.join(__dirname, '..', 'website');

    new BucketDeployment(this, 'DeployWebsite', {
      destinationBucket: siteBucket,
      distribution,
      retainOnDelete: removalPolicy === RemovalPolicy.RETAIN,
      sources: [Source.asset(source || placeHolderSource)],
    });

    // Route53 alias record for the CloudFront distribution
    const zone = HostedZone.fromLookup(this, 'Zone', {
      domainName,
    });
    new ARecord(this, 'SiteAliasRecord', {
      recordName: siteDomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone,
    });
  }
}
