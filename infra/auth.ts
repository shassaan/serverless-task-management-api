import AuthService  from './services/authService';
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda';

const authService = new AuthService();

export const register = async (event:  APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
  try {
    const { username, password } = JSON.parse(event.body || '{}');
    await authService.registerUser(username, password);
    callback(null, { statusCode: 200, body: JSON.stringify({ message: 'User registered successfully' }) });
  } catch (error) {
    console.error('Error registering user:', error);
    callback(null, { statusCode: 500, body: JSON.stringify({ error: 'Failed to register user' }) });
  }
};