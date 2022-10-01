import { Stack, App, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';

import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from "node:path"

const PACKAGE_DIR = path.join(__dirname, '..', '..')
const ROOT_DIR = path.join(PACKAGE_DIR, '..')
const DEPLOYMENT_DIR = path.join(ROOT_DIR, 'dist', 'apps', 'ng-budget')

interface AppStackProps {
  transient: boolean;
}

export class AppStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps & AppStackProps) {
    super(scope, id, props);

    const assetsBucket = new Bucket(this, 'assets-bucket', {
      publicReadAccess: true,
      websiteErrorDocument: 'index.html',
      websiteIndexDocument: 'index.html',
      removalPolicy: props.transient
        ? RemovalPolicy.DESTROY
        : RemovalPolicy.RETAIN,
    });

    new Distribution(this, 'cloudfront-distribution', {
      defaultBehavior: {
        origin: new S3Origin(assetsBucket)
      }
    })

    new BucketDeployment(this, 'deployment', {
      destinationBucket: assetsBucket,
      sources: [Source.asset(DEPLOYMENT_DIR)],
    });
  }
}
