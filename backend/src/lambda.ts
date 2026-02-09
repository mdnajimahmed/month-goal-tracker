import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import { initializeEnv } from './config/env-init.js';
import app from './index.js';

// Create serverless Express server
let server: any = null;

async function getServer() {
  if (!server) {
    // Initialize environment variables before creating server
    await initializeEnv();
    server = createServer(app);
  }
  return server;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Set Lambda context
  context.callbackWaitsForEmptyEventLoop = false;
  
  const expressServer = await getServer();
  return proxy(expressServer, event, context, 'PROMISE').promise;
};
