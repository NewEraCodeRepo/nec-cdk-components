#!/usr/bin/env node
import * as cloudtrail from '@aws-cdk/aws-cloudtrail';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';

export interface ICDKBoilerplateProps {
  bucketName: string;
}

/**
 * Boilerplate
 */
export class CDKBoilerplate extends Construct {
  public bucketWebsiteUrl: string;

  constructor(scope: Construct, id: string, props: ICDKBoilerplateProps) {
    super(scope, id);

    const bucket = new Bucket(this, 'CloudTrailBucket', {
      bucketName: props.bucketName,
    });
    // tslint:disable-next-line:no-unused-expression
    new cloudtrail.Trail(this, 'CloudTrail', {
      bucket,
      isMultiRegionTrail: true,
    });

    this.bucketWebsiteUrl = bucket.bucketWebsiteUrl;
  }
}
