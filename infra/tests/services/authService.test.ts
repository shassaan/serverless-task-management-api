import { CognitoIdentityServiceProvider } from 'aws-sdk';
import AuthService from '../../services/authService';

jest.mock('aws-sdk', () => {
    const mCognitoIdentityServiceProvider = {
        signUp: jest.fn().mockReturnThis(),
        promise: jest.fn(),
        initiateAuth: jest.fn().mockReturnThis(),
    };
    return { CognitoIdentityServiceProvider: jest.fn(() => mCognitoIdentityServiceProvider) };
});

describe('AuthService', () => {
    let authService: AuthService;
    let cognitoClientMock: jest.Mocked<CognitoIdentityServiceProvider>;

    beforeEach(() => {
        authService = new AuthService();
        cognitoClientMock = new CognitoIdentityServiceProvider() as jest.Mocked<CognitoIdentityServiceProvider>;
    });

    describe('registerUser', () => {
        it('should register a user successfully', async () => {
             cognitoClientMock.signUp().promise= jest.fn().mockResolvedValueOnce({});

            await authService.registerUser('testuser', 'testpassword');

            expect(cognitoClientMock.signUp).toHaveBeenCalledWith({
                ClientId: process.env.COGNITO_CLIENT_ID || "",
                Username: 'testuser',
                Password: 'testpassword',
            });
            expect(cognitoClientMock.signUp).toHaveBeenCalled();
        });

        it('should throw an error if registration fails', async () => {
            cognitoClientMock.signUp().promise = jest.fn().mockRejectedValueOnce(new Error('Registration failed'));

            await expect(authService.registerUser('testuser', 'testpassword')).rejects.toThrow('Registration failed');
        });
    });

    describe('loginUser', () => {
        it('should login a user successfully and return access token', async () => {
            const mockAccessToken = 'mockAccessToken';
            cognitoClientMock.initiateAuth().promise = jest.fn().mockResolvedValueOnce({
                AuthenticationResult: { AccessToken: mockAccessToken },
            });

            const result = await authService.loginUser('testuser', 'testpassword');

            expect(cognitoClientMock.initiateAuth).toHaveBeenCalledWith({
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: process.env.COGNITO_CLIENT_ID || "",
                AuthParameters: {
                    USERNAME: 'testuser',
                    PASSWORD: 'testpassword',
                },
            });
            expect(cognitoClientMock.initiateAuth).toHaveBeenCalled();
            expect(result).toBe(mockAccessToken);
        });

        it('should return an empty string if login fails', async () => {
            cognitoClientMock.initiateAuth().promise = jest.fn().mockResolvedValueOnce({});

            const result = await authService.loginUser('testuser', 'testpassword');

            expect(result).toBe("");
        });

        it('should throw an error if login fails', async () => {
            cognitoClientMock.initiateAuth().promise = jest.fn().mockRejectedValueOnce(new Error('Login failed'));

            await expect(authService.loginUser('testuser', 'testpassword')).rejects.toThrow('Login failed');
        });
    });
});