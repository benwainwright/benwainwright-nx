import {
  SecretsManagerClient,
  GetSecretValueCommand,
  GetSecretValueCommandInput,
} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({});

export const getSecrets = async (...secretNames: string[]) =>
  Promise.all(
    secretNames.map(async (secret) => {
      const input: GetSecretValueCommandInput = {
        SecretId: secret,
      };

      const response = await client.send(new GetSecretValueCommand(input));

      return response.SecretString;
    })
  );
