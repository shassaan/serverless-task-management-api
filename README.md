# Serverless Task Manager

This project is a serverless task management API built using AWS serverless technologies. It provides endpoints for managing tasks and user authentication and authorization using AWS Cognito.

## Project Structure

```
serverless-task-manager
├── src
│   ├── handlers
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   └── users.ts
│   ├── models
│   │   ├── task.ts
│   │   └── user.ts
│   ├── services
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   └── userService.ts
│   ├── utils
│   │   └── cognitoHelper.ts
│   └── types
│       └── index.ts
├── serverless.yml
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### User Registration

**Endpoint:** `POST /register`

This endpoint is used to register a new user.

### User Login

**Endpoint:** `POST /login`

This endpoint is used to authenticate a user and obtain an access token.

### Get Tasks

**Endpoint:** `GET /tasks`

This endpoint is used to retrieve all tasks.

### Create Task

**Endpoint:** `POST /tasks`

This endpoint is used to create a new task.

### Update Task

**Endpoint:** `PUT /tasks/{taskId}`

This endpoint is used to update an existing task.

### Delete Task

**Endpoint:** `DELETE /tasks/{taskId}`

This endpoint is used to delete a task.

## Setup and Deployment

1. Clone the repository.
2. Install the dependencies by running `npm install`.
3. Configure the AWS credentials in your environment.

## Technologies Used

- AWS Lambda
- AWS API Gateway
- AWS Cognito
- Amazon DynamoDB
- TypeScript

For detailed documentation on each endpoint and how to use them, please refer to the API documentation in the [API Documentation](./API_DOCUMENTATION.md) file.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.