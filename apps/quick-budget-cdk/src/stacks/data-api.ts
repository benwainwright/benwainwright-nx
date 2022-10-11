import { RemovalPolicy } from 'aws-cdk-lib';
import {
  AwsIntegration,
  JsonSchemaType,
  Model,
  RequestValidator,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  Effect,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface DataApiProps {
  resourceName: string;
  transient: boolean;
}

export class DataApi extends Construct {
  constructor(scope: Construct, id: string, props: DataApiProps) {
    super(scope, id);

    const idName = `${id}-${props.resourceName}`;

    const dynamoTable = new Table(this, `${idName}-table`, {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      removalPolicy: !props.transient
        ? RemovalPolicy.RETAIN
        : RemovalPolicy.DESTROY,
    });

    const api = new RestApi(this, `${idName}-api`, {});

    const resource = api.root.addResource(props.resourceName);

    const singleResource = resource.addResource('{id}');

    const dbPolicy = new Policy(this, `${idName}-api-policy`, {
      statements: [
        new PolicyStatement({
          actions: [
            'dynamodb:PutItem',
            'dynamodb:GetItem',
            'dynamodb:DeleteItem',
          ],
          effect: Effect.ALLOW,
          resources: [dynamoTable.tableArn],
        }),
      ],
    });

    const apiRole = new Role(this, `${idName}-api-role`, {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    apiRole.attachInlinePolicy(dbPolicy);

    const errorResponses = [
      {
        selectionPattern: '400',
        statusCode: '400',
        responseTemplates: {
          'application/json': `{
                        "error": "Bad input!",
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
        message: '',
      },
      ...errorResponses,
    ];

    const requestValidator = new RequestValidator(this, `${idName}-validator`, {
      restApi: api,
      validateRequestBody: true,
    });

    const payloadModel = new Model(this, `${idName}-validator-model`, {
      restApi: api,
      contentType: 'application/json',
      description: 'json schema to validate api payload',
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          id: {
            type: JsonSchemaType.STRING,
          },
        },
        required: ['id'],
      },
    });

    singleResource.addMethod(
      'GET',
      new AwsIntegration({
        service: 'dynamodb',
        action: 'GetItem',
        options: {
          credentialsRole: apiRole,
          integrationResponses,
          requestTemplates: {
            'application/json': `{
                "Key": {
                  "userId": {
                      "S": "$method.request.path.id"
                  }
                },
              "TableName": "${dynamoTable.tableName}"
            }`,
          },
        },
      }),
      {
        methodResponses: [
          {
            statusCode: '200',
            responseModels: {
              'application/json': Model.EMPTY_MODEL,
            },
          },
          { statusCode: '400' },
          { statusCode: '500' },
        ],
      }
    );

    const deleteAfterSeconds = 10;

    resource.addMethod(
      'POST',
      new AwsIntegration({
        service: 'dynamodb',
        action: 'PutItem',
        options: {
          credentialsRole: apiRole,
          integrationResponses: [
            {
              statusCode: '200',
              responseTemplates: {
                'application/json': `{
                "requestId": "$context.requestId"
              }`,
              },
            },
            ...errorResponses,
          ],
          requestTemplates: {
            'application/json': `#set($ttlEpoch = $context.requestTimeEpoch / 1000 + ${deleteAfterSeconds})
    {
        "Item":
        {
            "userId":
            {
                "S": "$input.path('$context.requestId')-$input.path('$.player_name')"
            },
            "correlationId":
            {
                "S": "$context.requestId"
            },
            "status":
            {
                "S": "to_be_confirmed"
            },
            "userName":
            {
                "S":"$input.path('$.user_name')"
            },
            "email":
            {
                "S": "$input.path('$.email')"
            },
            "locale":
            {
                "S": "$input.path('$.language_code')"
            },
            "ttl":
            {
                "N": "$ttlEpoch"
            }
        },
        "TableName": "${dynamoTable.tableName}"
    }`,
          },
        },
      }),
      {
        requestValidator,
        requestModels: { 'application/json': payloadModel },
        methodResponses: [
          {
            statusCode: '200',
            responseModels: {
              'application/json': Model.EMPTY_MODEL,
            },
          },
          { statusCode: '400' },
          { statusCode: '500' },
        ],
      }
    );
  }
}
