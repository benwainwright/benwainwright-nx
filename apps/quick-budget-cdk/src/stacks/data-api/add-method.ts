import { AwsIntegration, Resource } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  Effect,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export const addMethod = (
  context: Construct,
  id: string,
  method: string,
  action: string,
  requestTemplate: string,
  resource: Resource,
  table: Table
) => {
  const errorResponses = [
    {
      selectionPattern: '400',
      statusCode: '400',
      responseTemplates: {
        'application/json': `{
            "error": "Bad input!"
          }`,
      },
    },
    {
      selectionPattern: '5\\d{2}',
      statusCode: '500',
      responseTemplates: {
        'application/json': `{
            "error": "Internal Service Error!"
          }`,
      },
    },
  ];

  const integrationResponses = [
    {
      statusCode: '200',
    },
    ...errorResponses,
  ];

  const policy = new Policy(
    context,
    `${id}-${method.toLocaleLowerCase()}-${action.toLocaleLowerCase()}-policy`,
    {
      statements: [
        new PolicyStatement({
          actions: [`dynamodb:${action}`],
          effect: Effect.ALLOW,
          resources: [table.tableArn],
        }),
      ],
    }
  );

  const credentialsRole = new Role(
    context,
    `${id}-${method.toLocaleLowerCase()}-${action.toLocaleLowerCase()}-role`,
    {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    }
  );

  credentialsRole.attachInlinePolicy(policy);

  const methodOptions = {
    methodResponses: [
      { statusCode: '200' },
      { statusCode: '400' },
      { statusCode: '500' },
    ],
  };

  const integration = new AwsIntegration({
    action,
    options: {
      credentialsRole,
      integrationResponses,
      requestTemplates: {
        'application/json': requestTemplate,
      },
    },
    service: 'dynamodb',
  });

  resource.addMethod(method, integration, methodOptions);
};
