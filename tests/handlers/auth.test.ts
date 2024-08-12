import { register } from '../../src/handlers/auth';
import AuthService from '../../src/services/authService';
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';

jest.mock('../../src/services/authService');

describe('Auth Integration Tests', () => {
    let event: Partial<APIGatewayProxyEvent>;
    let context: Partial<Context>;
    let callback: jest.Mock;

    beforeAll(() => {
        AWSMock.setSDKInstance(AWS);
    });

    beforeEach(() => {
        event = {
            body: JSON.stringify({ username: 'testuser', password: 'password123' }),
        };
        context = {};
        callback = jest.fn();
    });

    afterEach(() => {
        AWSMock.restore('CognitoIdentityServiceProvider');
    });

    it('should register a new user successfully', async () => {
        AWSMock.mock('CognitoIdentityServiceProvider', 'signUp', (params, callback) => {
            callback(null, { UserSub: '12345' });
        });

        const authServiceMock = AuthService as jest.Mocked<typeof AuthService>;
        authServiceMock.prototype.registerUser = jest.fn().mockResolvedValue({ UserSub: '12345' });

        await register(event as APIGatewayProxyEvent, context as Context, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            statusCode: 200,
            body: JSON.stringify({ message: 'User registered successfully' }),
        });
    });

    it('should return an error if registration fails', async () => {
        AWSMock.mock('CognitoIdentityServiceProvider', 'signUp', (params, callback) => {
            callback(new Error('Registration failed'));
        });

        const authServiceMock = AuthService as jest.Mocked<typeof AuthService>;
        authServiceMock.prototype.registerUser = jest.fn().mockRejectedValue(new Error('Registration failed'));

        await register(event as APIGatewayProxyEvent, context as Context, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to register user' }),
        });
    });
});