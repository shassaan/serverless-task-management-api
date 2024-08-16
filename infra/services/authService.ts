import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { InitiateAuthRequest, SignUpRequest } from 'aws-sdk/clients/cognitoidentityserviceprovider';

class AuthService {
  private cognitoClient: CognitoIdentityServiceProvider;
  constructor() {
    this.cognitoClient = new CognitoIdentityServiceProvider();
  }

  async registerUser(username: string, password: string): Promise<void> {
    const params:SignUpRequest = {
      ClientId: process.env.COGNITO_CLIENT_ID || "",
      Username: username,
      Password: password
    };
    await this.cognitoClient.signUp(params).promise();
  }

  async loginUser(username: string, password: string): Promise<string> {
    const params:InitiateAuthRequest = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID || "",
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      },
    };

    const response = await this.cognitoClient.initiateAuth(params).promise();
    return response.AuthenticationResult?.AccessToken || "";
  }
}

export default AuthService;