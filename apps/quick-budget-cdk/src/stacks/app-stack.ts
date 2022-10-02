import { Stack, App, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';

import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from "node:path"
import { Environment } from './environment';
import { getDomainName } from './get-domain-name';

const PACKAGE_DIR = path.join(__dirname, '..', '..')
const ROOT_DIR = path.join(PACKAGE_DIR, '..', '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist')
const DEPLOYMENT_DIR = path.join(DIST_DIR, 'apps', 'ng-budget')

interface AppStackProps {
  transient: boolean;
  envName: Environment
}

interface BackendConfig {
  userpoolId: string
  userPoolClientId: string
}

export class AppStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps & AppStackProps) {
    super(scope, id, props);

    const removalPolicy = props.transient
      ? RemovalPolicy.DESTROY
      : RemovalPolicy.RETAIN

    const pool = new UserPool(this, 'user-pool', {
      removalPolicy,

      passwordPolicy: {
        minLength: 8,
        requireDigits: false,
        requireLowercase: false,
        requireSymbols: false,
        requireUppercase: false,
      },

      autoVerify: {
        email: true,
        phone: false,
      },

      signInCaseSensitive: false,

      signInAliases: {
        username: true,
        email: true,
      },
    })

    const client = new UserPoolClient(this, 'pool-client', {
      userPool: pool
    })
    
    const domainName = getDomainName(props.envName)

    const assetsBucket = new Bucket(this, 'assets-bucket', {
      bucketName: domainName,
      publicReadAccess: true,
      websiteErrorDocument: 'index.html',
      websiteIndexDocument: 'index.html',
      removalPolicy
    });

    const hostedZone = HostedZone.fromLookup(this, 'hosted-zone', {
      domainName
    })



    const certificate = new DnsValidatedCertificate(this, 'website-certificate', {
      region: 'us-east-1',
      hostedZone,
      domainName
    })

    const distribution = new Distribution(this, 'cloudfront-distribution', {
      domainNames: [domainName],
      certificate,
      defaultBehavior: {
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        origin: new S3Origin(assetsBucket),
      }
    })

    new ARecord(this, 'a-record', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(
        new CloudFrontTarget(distribution)
      )
    })

    const backendConfig: BackendConfig = {
      userpoolId: pool.userPoolId,
      userPoolClientId: client.userPoolClientId
    }

    new BucketDeployment(this, 'deployment', {
      destinationBucket: assetsBucket,
      sources: [
        Source.asset(DEPLOYMENT_DIR),
        Source.jsonData('backend-config.json', backendConfig)
      ],
      distribution
    });
  }
}
