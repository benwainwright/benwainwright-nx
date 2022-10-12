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

interface DataApiProps {
  resources: ResourceDefinition[];
  removalPolicy: RemovalPolicy;
  pool: UserPool;
  domainName?: string;
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

      addMethod(
        this,
        `${id}-${name}`,
        'GET',
        'GetItem',
        getAndDeleteTemplate,
        singleResource,
        table
      );

      addMethod(
        this,
        `${id}-${name}`,
        'GET',
        'Scan',
        `{ "TableName": "${table.tableName}" }`,
        allResource,
        table
      );

      addMethod(
        this,
        `${id}-${name}`,
        'POST',
        'PutItem',
        makeMappingTemplate(schema, table.tableName),
        allResource,
        table
      );

      addMethod(
        this,
        `${id}-${name}`,
        'PUT',
        'PutItem',
        makeMappingTemplate(schema, table.tableName),
        allResource,
        table
      );

      addMethod(
        this,
        `${id}-${name}`,
        'DELETE',
        'DeleteItem',
        getAndDeleteTemplate,
        allResource,
        table
      );

      return table;
    });

    if (props.domainName) {
      addDomain(this, `${id}-domain`, this.api, props.domainName);
    }
  }
}
