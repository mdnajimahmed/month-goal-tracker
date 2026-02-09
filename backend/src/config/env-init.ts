import { getEnvVar } from './env.js';

// Initialize environment variables asynchronously for Lambda
let envInitialized = false;

export async function initializeEnv() {
  if (envInitialized) {
    return;
  }

  // In Lambda, we need to load DATABASE_URL from SSM
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const dbUrl = await getEnvVar('DATABASE_URL');
      process.env.DATABASE_URL = dbUrl;
    } catch (error) {
      console.error('Failed to initialize DATABASE_URL from SSM:', error);
      throw error;
    }
  }

  envInitialized = true;
}
