import { RemovalPolicy } from 'aws-cdk-lib';
import {
  RestApi,
  CognitoUserPoolsAuthorizer,
  AuthorizationType,
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { ZodTypeAny } from 'zod';
import { addDomain } from './add-domain';
import { addMethod } from './add-method';
import { makeMappingTemplate } from './make-mapping-template';

interface ResourceDefinition {
  name: string;
  schema: ZodTypeAny;
}

type DeployedResource = {
  url: string;
  table: Table;
} & ResourceDefinition;

interface DataApiProps {
  resources: ResourceDefinition[];
  removalPolicy: RemovalPolicy;
  pool: UserPool;
  domainName?: string;
  primaryKeyName?: string;
  sortKeyName?: string;
}

export class DataApi extends Construct {
  public tables: Table[];
  public api: RestApi;
  public resources: DeployedResource[];

  constructor(scope: Construct, id: string, props: DataApiProps) {
    super(scope, id);

    const authorizer = new CognitoUserPoolsAuthorizer(this, `${id}-auth`, {
      cognitoUserPools: [props.pool],
    });

    this.api = new RestApi(this, `${id}-api`, {
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'Origin',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: [props.domainName, 'http://localhost:4200'],
      },
    });

    const sortKey = props.sortKeyName
      ? {
          sortKey: {
            name: props.sortKeyName,
            type: AttributeType.STRING,
          },
        }
      : {};

    const resources = props.resources.map(({ name, schema }) => {
      const table = new Table(this, `${id}-${name}-table`, {
        billingMode: BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: props.primaryKeyName ? props.primaryKeyName : `id`,
          type: AttributeType.STRING,
        },
        ...sortKey,
        removalPolicy: props.removalPolicy,
      });

      const allResource = this.api.root.addResource(name);
      const singleResource = allResource.addResource('{id}');

      const getAndDeleteTemplate = `
      {
        "Key": {
          "username": {
            "S": "$input.params().querystring.get('username')"
          },
          "id": {
            "S": "$method.request.path.id"
          }
        },
        "TableName": "${table.tableName}"
      }`;

      addMethod(
        this,
        `${id}-${name}`,
        'GET',
        'GetItem',
        getAndDeleteTemplate,
        singleResource,
        table,
        authorizer,
        props.domainName
      );

      addMethod(
        this,
        `${id}-${name}`,
        'GET',
        'Scan',
        `{ "TableName": "${table.tableName}" }`,
        allResource,
        table,
        authorizer,
        props.domainName
      );

      addMethod(
        this,
        `${id}-${name}`,
        'POST',
        'PutItem',
        makeMappingTemplate(schema, table.tableName),
        allResource,
        table,
        authorizer,
        props.domainName
      );

      addMethod(
        this,
        `${id}-${name}`,
        'PUT',
        'PutItem',
        makeMappingTemplate(schema, table.tableName),
        allResource,
        table,
        authorizer,
        props.domainName
      );

      addMethod(
        this,
        `${id}-${name}`,
        'DELETE',
        'DeleteItem',
        getAndDeleteTemplate,
        allResource,
        table,
        authorizer,
        props.domainName
      );

      return { table, schema, name };
    });

    if (props.domainName) {
      addDomain(this, `${id}-domain`, this.api, props.domainName);
    }

    const url = props.domainName
      ? `https://api.${props.domainName}`
      : this.api.url;

    this.resources = resources.map((resource) => ({
      ...resource,
      url: `${url}/${resource.name}`,
    }));
  }
}
