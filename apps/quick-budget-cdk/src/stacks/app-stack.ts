import { Stack, App, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { z } from 'zod';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
// import { settingsSchema } from '@benwainwright/budget-domain';
import {
  Distribution,
  OriginRequestPolicy,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { BackendConfig } from '@benwainwright/types';
import {
  CloudFrontTarget,
  UserPoolDomainTarget,
} from 'aws-cdk-lib/aws-route53-targets';

import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'node:path';
import { Environment } from './environment';
import { getDomainName } from './get-domain-name';
import { DataApi } from './data-api';

const PACKAGE_DIR = path.join(__dirname, '..', '..');
const ROOT_DIR = path.join(PACKAGE_DIR, '..', '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DEPLOYMENT_DIR = path.join(DIST_DIR, 'apps', 'ng-budget');

interface AppStackProps {
  transient: boolean;
  envName: Environment;
}

export class AppStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps & AppStackProps) {
    super(scope, id, props);

    const removalPolicy = props.transient
      ? RemovalPolicy.DESTROY
      : RemovalPolicy.RETAIN;

    const pool = new UserPool(this, 'user-pool', {
      removalPolicy,

      selfSignUpEnabled: true,
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
    });

    const domainName = getDomainName(props.envName);

    const hostedZone = HostedZone.fromLookup(this, 'hosted-zone', {
      domainName,
    });

    const certificate = new DnsValidatedCertificate(
      this,
      'website-certificate',
      {
        region: 'us-east-1',
        hostedZone,
        domainName,
        subjectAlternativeNames: [`*.${domainName}`],
      }
    );

    const userPoolDomain = pool.addDomain('user-pool-domain', {
      customDomain: {
        domainName: `auth.${domainName}`,
        certificate,
      },
    });

    new ARecord(this, 'a-record-for-cognito', {
      recordName: `auth.${domainName}`,
      zone: hostedZone,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(userPoolDomain)),
    });

    const client = new UserPoolClient(this, 'pool-client', {
      userPool: pool,
      oAuth: {
        flows: {
          implicitCodeGrant: true,
        },
        callbackUrls: [`https://${domainName}/`, `http://localhost:4200`],
      },
    });

    const paymentsSchema = z.object({
      id: z.string(),
      username: z.string(),
      when: z.string(),
      potId: z.string(),
      amount: z.string(),
    });

    const potsSchema = z.object({
      id: z.string(),
      username: z.string(),
      balance: z.string(),
      name: z.string(),
    });

    const settingsSchema = z.object({
      id: z.string(),
      username: z.string(),
      payCycle: z.string(),
      salary: z.number(),
      overdraft: z.number(),
    });

    const data = new DataApi(this, 'settings-api', {
      removalPolicy,
      pool,
      domainName,
      primaryKeyName: 'username',
      sortKeyName: 'id',
      resources: [
        {
          name: 'settings',
          schema: settingsSchema,
        },
        {
          name: 'payments',
          schema: paymentsSchema,
        },
        {
          name: 'pots',
          schema: potsSchema,
        },
      ],
    });
    // const budgets = makeApi('budgets-api');
    // const payments = makeApi('payments-api');

    const allowedOrigins = [`https://${domainName}`, `http://localhost:4200`];

    const assetsBucket = new Bucket(this, 'assets-bucket', {
      bucketName: domainName,
      publicReadAccess: true,
      websiteErrorDocument: 'index.html',
      websiteIndexDocument: 'index.html',
      removalPolicy,
      cors: [
        {
          allowedMethods: [HttpMethods.GET],
          allowedOrigins,
          allowedHeaders: [`*`],
        },
      ],
    });

    const responseHeadersPolicy = new ResponseHeadersPolicy(
      this,
      'response-headers-policy',
      {
        corsBehavior: {
          accessControlAllowCredentials: false,
          accessControlAllowHeaders: ['*'],
          accessControlAllowMethods: ['GET', 'OPTIONS'],
          accessControlAllowOrigins: allowedOrigins,
          originOverride: true,
        },
      }
    );

    const distribution = new Distribution(this, 'cloudfront-distribution', {
      domainNames: [domainName],
      certificate,
      defaultBehavior: {
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        origin: new S3Origin(assetsBucket),
        originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy,
      },
    });

    new ARecord(this, 'a-record', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    const backendConfig: BackendConfig = {
      region: Stack.of(this).region,
      userpoolId: pool.userPoolId,
      userPoolClientId: client.userPoolClientId,
      apiUrl: `https://api.${domainName}`,
      domainName,
      authSignInUrl: userPoolDomain.signInUrl(client, {
        redirectUri: `https://${domainName}/`,
      }),

      authSignInUrlForLocal: userPoolDomain.signInUrl(client, {
        redirectUri: `http://localhost:4200`,
      }),
      authSignUpUrl: userPoolDomain.signInUrl(client, {
        redirectUri: `https://${domainName}/`,
        signInPath: '/signup',
      }),

      authSignUpUrlForLocal: userPoolDomain.signInUrl(client, {
        redirectUri: `http://localhost:4200`,
        signInPath: '/signup',
      }),
      authSignOutUrl: userPoolDomain.signInUrl(client, {
        redirectUri: `https://${domainName}/`,
        signInPath: '/logout',
      }),
      authSignOutUrlForLocal: userPoolDomain.signInUrl(client, {
        redirectUri: `http://localhost:4200`,
        signInPath: '/logout',
      }),
    };

    new BucketDeployment(this, 'deployment', {
      destinationBucket: assetsBucket,
      sources: [
        Source.asset(DEPLOYMENT_DIR),
        Source.jsonData('backend-config.json', backendConfig),
      ],
      distribution,
    });
  }
}
