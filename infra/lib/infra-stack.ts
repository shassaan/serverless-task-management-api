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



    const createTaskFunction = new lambdaNodejs.NodejsFunction(
      this,
      "CreateTaskFunction",
      {
        code: lambda.Code.fromAsset("../src/handlers"),
        handler: "tasks.createTask",
        runtime: lambda.Runtime.NODEJS_20_X,
        architecture: lambda.Architecture.ARM_64,
        environment: {
          TABLE_NAME: tasksTable.tableName,
        },
      },
    );

    tasksTable.grantFullAccess(createTaskFunction);

    // create cognito user pool
    const userPool = new cognito.UserPool(this, "tasksUserPool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
    });

    const api = new apigateway.RestApi(this, "tasksapi", {
      restApiName: "Tasks Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    });

    api.root.addMethod("POST", new apigateway.LambdaIntegration(createTaskFunction));
  }
}
