// cognitoHelper.test.ts
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { getCognitoUser } from '../../src/utils/cognitoHelper';

// Mock the CognitoUserPool and CognitoUser classes
jest.mock('amazon-cognito-identity-js', () => {
    return {
        CognitoUserPool: jest.fn(),
        CognitoUser: jest.fn(),
    };
});

describe('getCognitoUser', () => {
    const mockCognitoUserPool = CognitoUserPool as jest.Mock;
    const mockCognitoUser = CognitoUser as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a CognitoUser with the provided username and environment variables', () => {
        process.env.COGNITO_USER_POOL_ID = 'testPoolId';
        process.env.COGNITO_CLIENT_ID = 'testClientId';

        const username = 'testuser';
        getCognitoUser(username);

        expect(mockCognitoUserPool).toHaveBeenCalledWith({
            UserPoolId: 'testPoolId',
            ClientId: 'testClientId',
        });

        expect(mockCognitoUser).toHaveBeenCalledWith({
            Username: username,
            Pool: expect.any(Object),
        });
    });

    it('should create a CognitoUser with empty strings if environment variables are not set', () => {
        delete process.env.COGNITO_USER_POOL_ID;
        delete process.env.COGNITO_CLIENT_ID;

        const username = 'testuser';
        getCognitoUser(username);

        expect(mockCognitoUserPool).toHaveBeenCalledWith({
            UserPoolId: '',
            ClientId: '',
        });

        expect(mockCognitoUser).toHaveBeenCalledWith({
            Username: username,
            Pool: expect.any(Object),
        });
    });
});