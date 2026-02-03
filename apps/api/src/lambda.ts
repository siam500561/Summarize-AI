import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import serverless from "serverless-http";
import app from "./index";

const serverlessHandler = serverless(app);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // Don't wait for event loop to be empty
  context.callbackWaitsForEmptyEventLoop = false;

  const result = await serverlessHandler(event, context);
  return result as APIGatewayProxyResult;
};
