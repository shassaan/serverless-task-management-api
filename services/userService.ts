import { User } from '../models/user';
import { getCognitoUser } from '../utils/cognitoHelper';
import { CognitoUser } from 'amazon-cognito-identity-js';

export class UserService {

  public async getCurrentUser(username:string): Promise<User | null> {
    const cognitoUser = getCognitoUser(username);

    if (!cognitoUser) {
      return null;
    }

    return this.mapCognitoUserToUser(cognitoUser);
  }
  mapCognitoUserToUser(cognitoUser: CognitoUser): User | PromiseLike<User | null> | null {
    const user:User =  {
      username: cognitoUser.getUsername(),
      email: cognitoUser.getUsername(),
    };
    return user;
  }
}