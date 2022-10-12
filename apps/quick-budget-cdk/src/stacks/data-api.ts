import { RemovalPolicy } from 'aws-cdk-lib';
import {
  AwsIntegration,
  RestApi,
  Resource,
  CognitoUserPoolsAuthorizer,
  AuthorizationType,
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  Effect,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ZodTypeAny } from 'zod';
import { makeMappingTemplate } from './make-mapping-template';

interface ResourceDefinition {
  name: string;
  schema: ZodTypeAny;
}

interface DataApiProps {
  resources: ResourceDefinition[];
  removalPolicy: RemovalPolicy;
  pool: UserPool;
}

export class DataApi extends Construct {
  public tables: Table[];
  public api: RestApi;
  constructor(scope: Construct, id: string, props: DataApiProps) {
    super(scope, id);

    const authorizer = new CognitoUserPoolsAuthorizer(this, `${id}-auth`, {
      cognitoUserPools: [props.pool],
    });

    this.api = new RestApi(this, `${id}-api`, {
      defaultMethodOptions: {
        authorizer,
        authorizationType: AuthorizationType.COGNITO,
      },
    });

    this.tables = props.resources.map(({ name, schema }) => {
      const table = new Table(this, `${id}-${name}-table`, {
        billingMode: BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: `id`,
          type: AttributeType.STRING,
        },
        removalPolicy: props.removalPolicy,
      });

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

      const addMethod = (
        method: string,
        action: string,
        requestTemplate: string,
        resource: Resource,
        table: Table
      ) => {
        const policy = new Policy(
          this,
          `${id}-${name}-${method.toLocaleLowerCase()}-${action.toLocaleLowerCase()}-policy`,
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
          this,
          `${id}-${name}-${method.toLocaleLowerCase()}-${action.toLocaleLowerCase()}-role`,
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

      const allResource = this.api.root.addResource(name);
      const singleResource = allResource.addResource('{id}');

      const getAndDeleteTemplate = `
      {
        "Key": {
          "id": {
            "S": "$method.request.path.id"
          }
        },
        "TableName": "${table.tableName}"
      }`;

      addMethod('GET', 'GetItem', getAndDeleteTemplate, singleResource, table);

      addMethod(
        'GET',
        'Scan',
        `{ "TableName": "${table.tableName}" }`,
        allResource,
        table
      );
      addMethod(
        'POST',
        'PutItem',
        makeMappingTemplate(schema, table.tableName),
        allResource,
        table
      );
      addMethod(
        'PUT',
        'PutItem',
        makeMappingTemplate(schema, table.tableName),
        allResource,
        table
      );

      addMethod(
        'DELETE',
        'DeleteItem',
        getAndDeleteTemplate,
        allResource,
        table
      );

      return table;
    });
  }
}
