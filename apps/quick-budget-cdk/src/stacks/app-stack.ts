import { Stack, App, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  Distribution,
  OriginRequestPolicy,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import {
  StringAttribute,
  UserPool,
  UserPoolClient,
} from 'aws-cdk-lib/aws-cognito';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { BackendConfig } from '@benwainwright/types';

import {
  budgetSchema,
  settingsSchema,
  paymentSchema,
  potSchema,
} from '@benwainwright/budget-domain';

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
import { COGNITO, IAM } from '@benwainwright/constants';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

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

      customAttributes: {
        [`custom:${COGNITO.customFields.userId}`]: new StringAttribute({
          mutable: true,
        }),
        [`custom:${COGNITO.customFields.accessToken}`]: new StringAttribute({
          mutable: true,
        }),
        [`custom:${COGNITO.customFields.expiresIn}`]: new StringAttribute({
          mutable: true,
        }),
        [`custom:${COGNITO.customFields.refreshToken}`]: new StringAttribute({
          mutable: true,
        }),
        ['dummy']: new StringAttribute({ mutable: true }),
        [COGNITO.customFields.userId]: new StringAttribute({ mutable: true }),
        [COGNITO.customFields.accessToken]: new StringAttribute({
          mutable: true,
        }),
        [COGNITO.customFields.expiresIn]: new StringAttribute({
          mutable: true,
        }),
        [COGNITO.customFields.expiresAt]: new StringAttribute({
          mutable: true,
        }),
        [COGNITO.customFields.refreshToken]: new StringAttribute({
          mutable: true,
        }),
      },

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

    const allowedOrigins = [
      `https://${domainName}`,
      `http://localhost:4200`,
      `http://192.168.1.102:4200`,
    ];

    const clientIdSecret = new Secret(this, `clientid`);
    const clientSecretSecret = new Secret(this, `clientSecret`);
    const redirectUriSecret = new Secret(this, `redirectUri`);

    const accountsFunction = new NodejsFunction(this, 'accounts-function', {
      environment: {
        MONZO_CLIENT_ID_SECRET: clientIdSecret.secretName,
        MONZO_CLIENT_SECRET_SECRET: clientSecretSecret.secretName,
        MONZO_REDIRECT_URI_SECRET: redirectUriSecret.secretName,
        ADD_ENV: 'stri',
        USER_POOL_ID: pool.userPoolId,
        NODE_OPTIONS: '--enable-source-maps',
      },
      timeout: Duration.minutes(5),
      bundling: {
        sourceMap: true,
      },
      entry: path.join(
        __dirname,
        '..',
        '..',
        '..',
        'ng-budget',
        'src',
        'backend',
        'lambda-handlers',
        'monzo',
        'get-accounts.ts'
      ),
    });

    const potsFunction = new NodejsFunction(this, 'pots-function', {
      environment: {
        MONZO_CLIENT_ID_SECRET: clientIdSecret.secretName,
        MONZO_CLIENT_SECRET_SECRET: clientSecretSecret.secretName,
        MONZO_REDIRECT_URI_SECRET: redirectUriSecret.secretName,
        ADD_ENV: 'stri',
        USER_POOL_ID: pool.userPoolId,
        NODE_OPTIONS: '--enable-source-maps',
      },
      timeout: Duration.minutes(5),
      bundling: {
        sourceMap: true,
      },
      entry: path.join(
        __dirname,
        '..',
        '..',
        '..',
        'ng-budget',
        'src',
        'backend',
        'lambda-handlers',
        'monzo',
        'get-pots.ts'
      ),
    });

    const depositPotFunction = new NodejsFunction(
      this,
      'deposit-pot-function',
      {
        environment: {
          MONZO_CLIENT_ID_SECRET: clientIdSecret.secretName,
          MONZO_CLIENT_SECRET_SECRET: clientSecretSecret.secretName,
          MONZO_REDIRECT_URI_SECRET: redirectUriSecret.secretName,
          ADD_ENV: 'stri',
          USER_POOL_ID: pool.userPoolId,
          NODE_OPTIONS: '--enable-source-maps',
        },
        timeout: Duration.minutes(5),
        bundling: {
          sourceMap: true,
        },
        entry: path.join(
          __dirname,
          '..',
          '..',
          '..',
          'ng-budget',
          'src',
          'backend',
          'lambda-handlers',
          'monzo',
          'deposit-into-pot.ts'
        ),
      }
    );

    const withDrawFromPotFunction = new NodejsFunction(
      this,
      'withdraw-pot-function',
      {
        environment: {
          MONZO_CLIENT_ID_SECRET: clientIdSecret.secretName,
          MONZO_CLIENT_SECRET_SECRET: clientSecretSecret.secretName,
          MONZO_REDIRECT_URI_SECRET: redirectUriSecret.secretName,
          ADD_ENV: 'strin',
          USER_POOL_ID: pool.userPoolId,
          NODE_OPTIONS: '--enable-source-maps',
        },
        timeout: Duration.minutes(5),
        bundling: {
          sourceMap: true,
        },
        entry: path.join(
          __dirname,
          '..',
          '..',
          '..',
          'ng-budget',
          'src',
          'backend',
          'lambda-handlers',
          'monzo',
          'withdraw-from-pot.ts'
        ),
      }
    );

    const balanceFunction = new NodejsFunction(this, 'balance-function', {
      environment: {
        MONZO_CLIENT_ID_SECRET: clientIdSecret.secretName,
        MONZO_CLIENT_SECRET_SECRET: clientSecretSecret.secretName,
        MONZO_REDIRECT_URI_SECRET: redirectUriSecret.secretName,
        USER_POOL_ID: pool.userPoolId,
        ADD_ENV: 'stri',
        NODE_OPTIONS: '--enable-source-maps',
      },
      bundling: {
        sourceMap: true,
      },
      timeout: Duration.minutes(5),
      entry: path.join(
        __dirname,
        '..',
        '..',
        '..',
        'ng-budget',
        'src',
        'backend',
        'lambda-handlers',
        'monzo',
        'get-balance.ts'
      ),
    });

    const api = new DataApi(this, 'settings-api', {
      removalPolicy,
      pool,
      domainName,
      primaryKeyName: 'username',
      sortKeyName: 'id',
      allowOrigins: allowedOrigins,
      resources: [
        {
          name: 'budgets',
          schema: budgetSchema,
        },
        {
          name: 'settings',
          schema: settingsSchema,
        },
        {
          name: 'payments',
          schema: paymentSchema,
        },
        {
          name: 'pots',
          schema: potSchema,
        },
      ],
    });

    const monzoApi = api.api.root.addResource('monzo');

    const potResource = monzoApi.addResource('pot');

    const depositIntoPotResource = potResource
      .addResource('deposit')
      .addResource('{potId}');

    const withdrawPotResource = potResource
      .addResource('withdraw')
      .addResource('{potId}');

    withdrawPotResource.addMethod(
      'POST',
      new LambdaIntegration(withDrawFromPotFunction)
    );
    withDrawFromPotFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          IAM.actions.cognito.adminUpdateUserAttributes,
          IAM.actions.cognito.adminGetUser,
        ],
        resources: [pool.userPoolArn],
      })
    );

    depositIntoPotResource.addMethod(
      'POST',
      new LambdaIntegration(depositPotFunction)
    );
    depositPotFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          IAM.actions.cognito.adminUpdateUserAttributes,
          IAM.actions.cognito.adminGetUser,
        ],
        resources: [pool.userPoolArn],
      })
    );

    const accountsResource = monzoApi.addResource('accounts');
    accountsResource.addMethod('GET', new LambdaIntegration(accountsFunction));
    accountsFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          IAM.actions.cognito.adminUpdateUserAttributes,
          IAM.actions.cognito.adminGetUser,
        ],
        resources: [pool.userPoolArn],
      })
    );

    const potsResource = monzoApi
      .addResource('pots')
      .addResource('{accountId}');

    potsResource.addMethod('GET', new LambdaIntegration(potsFunction));

    potsFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          IAM.actions.cognito.adminUpdateUserAttributes,
          IAM.actions.cognito.adminGetUser,
        ],
        resources: [pool.userPoolArn],
      })
    );

    clientSecretSecret.grantRead(accountsFunction);
    clientSecretSecret.grantRead(depositPotFunction);
    clientSecretSecret.grantRead(potsFunction);
    clientSecretSecret.grantRead(withDrawFromPotFunction);
    clientSecretSecret.grantRead(balanceFunction);
    clientIdSecret.grantRead(accountsFunction);
    clientIdSecret.grantRead(depositPotFunction);
    clientIdSecret.grantRead(potsFunction);
    clientIdSecret.grantRead(withDrawFromPotFunction);
    clientIdSecret.grantRead(balanceFunction);
    redirectUriSecret.grantRead(accountsFunction);
    redirectUriSecret.grantRead(depositPotFunction);
    redirectUriSecret.grantRead(balanceFunction);
    redirectUriSecret.grantRead(potsFunction);
    redirectUriSecret.grantRead(withDrawFromPotFunction);

    const balanceResource = monzoApi
      .addResource('balance')
      .addResource('{accountId}');

    balanceResource.addMethod('GET', new LambdaIntegration(balanceFunction));
    balanceFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          IAM.actions.cognito.adminGetUser,
          IAM.actions.cognito.adminUpdateUserAttributes,
        ],
        resources: [pool.userPoolArn],
      })
    );

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
