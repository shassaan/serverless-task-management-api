import { CognitoUser, CognitoUserPool, ICognitoUserPoolData } from 'amazon-cognito-identity-js';

export const getCognitoUser = (username: string): CognitoUser => {
  const poolData:ICognitoUserPoolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID || "",
    ClientId: process.env.COGNITO_CLIENT_ID || "",
  };

  const userPool = new CognitoUserPool(poolData);
  const userData = {
    Username: username,
    Pool: userPool,
  };

  return new CognitoUser(userData);
};