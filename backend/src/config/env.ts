import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

let cachedParams: Record<string, string> | null = null;

async function loadSSMParameters(): Promise<Record<string, string>> {
  if (cachedParams) {
    return cachedParams;
  }

  // Only load from SSM if we're in AWS Lambda environment
  if (process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.SSM_PREFIX) {
    const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });
    const prefix = process.env.SSM_PREFIX;
    
    const { SecretsManagerClient, GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager');
    const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

    const paramMap: Record<string, string> = {};
    
    try {
      // Get database endpoint
      const endpointCommand = new GetParameterCommand({
        Name: `${prefix}/DATABASE_ENDPOINT`,
        WithDecryption: false,
      });
      const endpointResponse = await ssmClient.send(endpointCommand);
      const endpoint = endpointResponse.Parameter?.Value;

      // Get secret ARN
      const secretArnCommand = new GetParameterCommand({
        Name: `${prefix}/DATABASE_SECRET_ARN`,
        WithDecryption: false,
      });
      const secretArnResponse = await ssmClient.send(secretArnCommand);
      const secretArn = secretArnResponse.Parameter?.Value;

      if (endpoint && secretArn) {
        // Get database credentials from Secrets Manager
        const secretCommand = new GetSecretValueCommand({
          SecretId: secretArn,
        });
        const secretResponse = await secretsClient.send(secretCommand);
        const secret = JSON.parse(secretResponse.SecretString || '{}');
        
        // Construct database URL
        const dbUrl = `postgresql://${secret.username}:${secret.password}@${endpoint}:5432/goal_tracker?schema=public`;
        paramMap['DATABASE_URL'] = dbUrl;
      }
    } catch (error) {
      console.error('Failed to load database configuration from SSM:', error);
    }

    cachedParams = paramMap;
    return paramMap;
  }

  return {};
}

export async function getEnvVar(key: string): Promise<string> {
  // First check environment variables (for local dev)
  if (process.env[key]) {
    return process.env[key]!;
  }

  // Then check SSM (for AWS Lambda)
  const ssmParams = await loadSSMParameters();
  if (ssmParams[key]) {
    return ssmParams[key];
  }

  throw new Error(`Environment variable ${key} not found`);
}

export function getEnvVarSync(key: string): string {
  if (process.env[key]) {
    return process.env[key]!;
  }
  throw new Error(`Environment variable ${key} not found`);
}
