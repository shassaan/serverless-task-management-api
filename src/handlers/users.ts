import AuthService  from '../services/authService';
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda';

const authService = new AuthService();

export const loginUser = async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
  try {
    const { username, password } = JSON.parse(event.body || '{}');

    // Authenticate user using AWS Cognito
    const accessToken = await authService.loginUser(username, password);

    // Return the access token
    callback(null, { statusCode: 200, body: JSON.stringify({ accessToken }) });
  } catch (error) {
    console.error('Error logging in user:', error);
    callback(null, { statusCode: 500, body: JSON.stringify({ error: 'Failed to login user' }) });
  }
};