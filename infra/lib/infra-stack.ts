import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const tasksTable = new dynamodb.Table(this, "tasks", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });


    // lambda functions
    const createTaskFunction = new lambdaNodejs.NodejsFunction(
      this,
      "CreateTaskFunction",
      {
        code: lambda.Code.fromAsset("../src"),
        handler: "handlers/tasks.createTask",
        runtime: lambda.Runtime.NODEJS_20_X,
        architecture: lambda.Architecture.ARM_64,
        environment: {
          TABLE_NAME: tasksTable.tableName,
        },
      },
    );

    tasksTable.grantFullAccess(createTaskFunction);

    const registerUserFunction = new lambdaNodejs.NodejsFunction(
      this,
      "RegisterUserFunction",
      {
        code: lambda.Code.fromAsset("../src"),
        handler: "handlers/auth.register",
        runtime: lambda.Runtime.NODEJS_20_X,
        architecture: lambda.Architecture.ARM_64,
      },
    );

    const loginFunction = new lambdaNodejs.NodejsFunction(
      this,
      "LoginFunction",
      {
        code: lambda.Code.fromAsset("../src"),
        handler: "handlers/users.loginUser",
        runtime: lambda.Runtime.NODEJS_20_X,
        architecture: lambda.Architecture.ARM_64,
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
