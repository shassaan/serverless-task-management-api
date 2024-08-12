import { loginUser } from '../../src/handlers/users';
import AuthService from '../../src/services/authService';
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

jest.mock('../../src/services/authService');

describe('Users Integration Tests', () => {
    let event: Partial<APIGatewayProxyEvent>;
    let context: Partial<Context>;
    let callback: jest.Mock;

    beforeEach(() => {
        event = {
            body: JSON.stringify({ username: 'testuser', password: 'testpassword' })
        };
        context = {};
        callback = jest.fn();
    });

    it('should login a user successfully', async () => {
        const mockAccessToken = 'mockAccessToken';

        const authServiceMock = AuthService as jest.Mocked<typeof AuthService>;
        authServiceMock.prototype.loginUser = jest.fn().mockResolvedValue(mockAccessToken);

        await loginUser(event as APIGatewayProxyEvent, context as Context, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            statusCode: 200,
            body: JSON.stringify({ accessToken: mockAccessToken }),
        });
    });

    it('should return an error if login fails', async () => {
        const authServiceMock = AuthService as jest.Mocked<typeof AuthService>;
        authServiceMock.prototype.loginUser = jest.fn().mockRejectedValue(new Error('Login failed'));

        await loginUser(event as APIGatewayProxyEvent, context as Context, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to login user' }),
        });
    });
});