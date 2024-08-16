import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as aws_ecr from "aws-cdk-lib/aws-ecr";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from 'path';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const tasksTable = new dynamodb.Table(this, "tasks", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const repo = aws_ecr.Repository.fromRepositoryName(this, "Repository", "cdk-hnb659fds-container-assets-011528268677-us-east-1")
    // lambda functions
    const createTaskFunction = new lambdaNodejs.NodejsFunction(
      this,
      "CreateTaskFunction",
      {
        entry: path.join(__dirname, `/../tasks.ts`),
        handler: "createTask",
        runtime: lambda.Runtime.NODEJS_20_X,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 3008,
        environment: {
          TABLE_NAME: tasksTable.tableName,
        },
      },
    );


    const updateTaskFunction = new lambdaNodejs.NodejsFunction(
      this,
      "UpdateTaskFunction",
      {
        entry: path.join(__dirname, `/../tasks.ts`),
        handler: "updateTask",
        runtime: lambda.Runtime.NODEJS_20_X,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 3008,
        environment: {
          TABLE_NAME: tasksTable.tableName,
        },
      },
    );


    const deleteTaskFunction = new lambdaNodejs.NodejsFunction(
      this,
      "DeleteTaskFunction",
      {
        entry: path.join(__dirname, `/../tasks.ts`),
        handler: "deleteTask",
        runtime: lambda.Runtime.NODEJS_20_X,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 3008,
        environment: {
          TABLE_NAME: tasksTable.tableName,
        },
      },
    );

    tasksTable.grantFullAccess(createTaskFunction);
    
    const registerUserFunction = new lambdaNodejs.NodejsFunction(this, 'RegisterUserFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,  // or appropriate runtime
      entry: path.join(__dirname, `/../auth.ts`),
      handler: "register",
      memorySize: 3008,
      environment: {
        COGNITO_CLIENT_ID: '5vnotmgnd2qrt59ll492v27rgq'
      }
    });

    const loginFunction = new lambdaNodejs.NodejsFunction(
      this,
      "LoginFunction",
      {
        entry: path.join(__dirname, `/../users.ts`),
        handler: "loginUser",
        runtime: lambda.Runtime.NODEJS_20_X,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 3008,
        environment: {
          COGNITO_CLIENT_ID: '5vnotmgnd2qrt59ll492v27rgq'
        }
      },
    );


    // create cognito user pool
    const userPool = new cognito.UserPool(this, "tasksUserPool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
    });


    const auth = new apigateway.CognitoUserPoolsAuthorizer(this, 'tasksAuthorizer', {
      cognitoUserPools: [userPool],
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
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizationScopes: ["openid", "aws.cognito.signin.user.admin"],
    });


    taskResource.addResource("{id}");
    taskResource.addMethod("PUT", new apigateway.LambdaIntegration(updateTaskFunction), {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizationScopes: ["openid", "aws.cognito.signin.user.admin"],
    });


    // const taskDeleteResource = taskResource.addResource("{id}");
    // taskDeleteResource.addMethod("DELETE", new apigateway.LambdaIntegration(deleteTaskFunction), {
    //   authorizer: auth,
    //   authorizationType: apigateway.AuthorizationType.COGNITO,
    //   authorizationScopes: ["openid", "aws.cognito.signin.user.admin"],
    // });



    const authLoginResource = api.root.addResource("login");
    authLoginResource.addMethod("POST", new apigateway.LambdaIntegration(loginFunction));

    const authResource = api.root.addResource("signup");
    authResource.addMethod("POST", new apigateway.LambdaIntegration(registerUserFunction));
  }
}
