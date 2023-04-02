export const COGNITO = {
  customFields: {
    accessToken: `accessToken`,
    refreshToken: `refreshToken`,
    expiresIn: `expiresIn`,
    expiresAt: `expiresAt`,
    userId: `userId`,
  },
};

export const ENVIRONMENT_NAMES = {
  prod: 'prod',
};

export const ENV = {
  ENVIRONMENT_NAME: 'ENVIRONMENT_NAME',
};

export const HTTP = {
  headerNames: {
    AccessControlAllowOrigin: 'access-control-allow-origin',
    AccessControlAllowCredentials: 'access-control-allow-credentials',
    AccessControlAllowHeaders: 'access-control-allow-headers',
    Origin: 'origin',
    ContentType: 'Content-Type',
    XAmxDate: 'X-Amz-Date',
    Authorization: 'Authorization',
    XApiKey: 'X-Api-Key',
  },
  statusCodes: {
    BadRequest: 400,
    Forbidden: 403,
    Ok: 200,
    InternalServerError: 500,
  },
};

const services = {
  secretsManager: 'secretsmanager',
  dynamodb: 'dynamodb',
  ses: 'ses',
  cloudformation: 'cloudformation',
  cognito: 'cognito-idp',
} as const;

interface IAMType {
  actions: {
    [K in keyof typeof services]: {
      [key: string]: `${typeof services[K]}:${string}`;
    };
  };
}

export const IAM: IAMType = {
  actions: {
    secretsManager: {
      getSecret: 'secretsmanager:GetSecretValue',
    },
    dynamodb: {
      putItem: 'dynamodb:putItem',
    },
    ses: {
      sendEmail: 'ses:SendEmail',
    },
    cloudformation: {
      listStacks: 'cloudformation:ListStacks',
      listStar: 'cloudformation:List*',
      getStar: 'cloudformation:Get*',
      describeStar: 'cloudformation:Describe*',
    },
    cognito: {
      listUsers: 'cognito-idp:ListUsers',
      adminGetUser: 'cognito-idp:AdminGetUser',
      adminGetStar: 'cognito-idp:AdminGet*',
      adminListStar: 'cognito-idp:AdminList*',
      getStar: 'cognito-idp:Get*',
      describeStar: 'cognito-idp:Describe*',
      listStar: 'cognito-idp:List*',
      adminCreateUser: 'cognito-idp:AdminCreateUser',
      adminDeleteUser: 'cognito-idp:AdminDeleteUser',
      adminDisableUser: 'cognito-idp:AdminDisableUser',
      adminListGroupsForUser: 'cognito-idp:AdminListGroupsForUser',
      adminRemoveUserFromGroup: 'cognito-idp:AdminRemoveUserFromGroup',
      adminUserGlobalSignout: 'cognito-idp:AdminUserGlobalSignOut',
      adminSetUserPassword: 'cognito-idp:AdminSetUserPassword',
      adminUpdateUserAttributes: 'cognito-idp:AdminUpdateUserAttributes',
      adminAddUserToGroup: 'cognito-idp:AdminAddUserToGroup',
    },
  },
} as const;
