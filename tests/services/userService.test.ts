// userService.test.ts
import { UserService } from '../../src/services/userService';
import { getCognitoUser } from '../../src/utils/cognitoHelper';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { User } from '../../src/models/user';

// Mock the getCognitoUser function
jest.mock('../../src/utils/cognitoHelper', () => ({
    getCognitoUser: jest.fn(),
}));

// Mock the CognitoUser class
const mockCognitoUser = {
    getUsername: jest.fn(),
} as unknown as CognitoUser;

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
    });

    it('should return null if getCognitoUser returns null', async () => {
        (getCognitoUser as jest.Mock).mockReturnValue(null);

        const result = await userService.getCurrentUser('testuser');
        expect(result).toBeNull();
    });

    it('should return a User object if getCognitoUser returns a valid CognitoUser', async () => {
        (getCognitoUser as jest.Mock).mockReturnValue(mockCognitoUser);
        mockCognitoUser.getUsername = jest.fn().mockReturnValue('testuser');

        const result = await userService.getCurrentUser('testuser');
        expect(result).toEqual({
            username: 'testuser',
            email: 'testuser',
        });
    });
});