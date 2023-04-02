import { APIGatewayProxyEventV2 } from 'aws-lambda';

export const getHeader = (header: string, event: APIGatewayProxyEventV2) => {
  return Object.entries(event.headers).find(
    ([key]) => key.toLocaleLowerCase() === header.toLocaleLowerCase()
  )?.[1];
};
