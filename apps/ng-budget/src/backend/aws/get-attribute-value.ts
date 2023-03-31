import { AttributeType } from '@aws-sdk/client-cognito-identity-provider';

export const getAttributeValue = (
  attributes: AttributeType[] | undefined,
  key: string
) => attributes?.find((attribute) => attribute.Name === key)?.Value 
