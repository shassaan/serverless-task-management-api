import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as aws_ecr from "aws-cdk-lib/aws-ecr";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const tasksTable = new dynamodb.Table(this, "tasks", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const repo = aws_ecr.Repository.fromRepositoryName(this, "Repository", "cdk-hnb659fds-container-assets-011528268677-us-east-1")
    // lambda functions
    const createTaskFunction = new lambda.Function(
      this,
      "CreateTaskFunction",
      {
        code: lambda.Code.fromEcrImage(repo, { tag: '0.0.1' }),
        handler: lambda.Handler.FROM_IMAGE,
        runtime: lambda.Runtime.FROM_IMAGE,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 3008,
        environment: {
          TABLE_NAME: tasksTable.tableName,
        },
      },
    );

    tasksTable.grantFullAccess(createTaskFunction);
    
    const registerUserFunction = new lambda.Function(this, 'RegisterUserFunction', {
      runtime: lambda.Runtime.FROM_IMAGE,  // or appropriate runtime
      code: lambda.Code.fromEcrImage(repo, { tag: '0.0.1' }),
      handler: lambda.Handler.FROM_IMAGE,
      memorySize: 3008,
    });

    const loginFunction = new lambda.Function(
      this,
      "LoginFunction",
      {
        code: lambda.Code.fromEcrImage(repo, { tag: '0.0.1' }),
        handler: lambda.Handler.FROM_IMAGE,
        runtime: lambda.Runtime.FROM_IMAGE,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 3008,
      },
    );


    // create cognito user pool
    const userPool = new cognito.UserPool(this, "tasksUserPool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
    });

    const auth = new apigateway.CognitoUserPoolsAuthorizer(this, 'tasksAuthorizer', {
      cognitoUserPools: [userPool]
    });



    // APIs for tasks 
    const api = new apigateway.RestApi(this, "tasksapi", {
      restApiName: "Tasks Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      }
    });
    const taskResource = api.root.addResource("tasks");

    taskResource.addMethod("POST", new apigateway.LambdaIntegration(createTaskFunction), {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });



    const authLoginResource = api.root.addResource("login");
    authLoginResource.addMethod("POST", new apigateway.LambdaIntegration(loginFunction));

    const authResource = api.root.addResource("signup");
    authResource.addMethod("POST", new apigateway.LambdaIntegration(registerUserFunction));
  }
}
