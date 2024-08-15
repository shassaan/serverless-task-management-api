import { Task } from '../models/task';
import { DynamoDB } from 'aws-sdk';

class TaskService {
  private readonly tableName: string;
  private readonly dynamoDB: DynamoDB.DocumentClient;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.dynamoDB = new DynamoDB.DocumentClient();
  }

  async getTasks(): Promise<Task[]> {
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: this.tableName,
    };

    const result = await this.dynamoDB.scan(params).promise();

    return result.Items as Task[];
  }

  async createTask(task: Task): Promise<Task> {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: task,
    };

    await this.dynamoDB.put(params).promise();

    return task;
  }

  async updateTask(task: Task): Promise<Task> {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: task,
    };

    await this.dynamoDB.put(params).promise();

    return task;
  }

  async deleteTask(taskId: string): Promise<void> {
    const params: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: this.tableName,
      Key: {
        id: taskId,
      },
    };

    await this.dynamoDB.delete(params).promise();
  }
}

export default TaskService;