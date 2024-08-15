import { Task } from './models/task';
import TaskService from './services/taskService';
import { Request, Response } from './types';
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda';


const taskService = new TaskService('tasks');

export const getTasks = async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
  try {
    const tasks = await taskService.getTasks();
    callback(null, { statusCode: 200, body: JSON.stringify(tasks) });
  } catch (error) {
    console.error('Error getting tasks:', error);
    callback(null, { statusCode: 500, body: JSON.stringify({ error: 'Failed to get tasks' }) });
  }
};

export const createTask = async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
  try {
    const { title, description } = JSON.parse(event.body || '{}');
    let task: Task = {
      id: Math.random().toString(36).substring(7),
      title: title,
      description: description,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "test-user"
    };
    task = await taskService.createTask(task);
    callback(null, { statusCode: 200, body: JSON.stringify(task) });
  } catch (error) {
    console.error('Error creating task:', error);
    callback(null, { statusCode: 500, body: JSON.stringify({ error: 'Failed to create task' }) });
  }
};

export const updateTask = async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
  try {
    const { id } = event.pathParameters || {};
    const { title, description } = JSON.parse(event.body || '{}');
    let task: Task = {
      id: id || "",
      title: title,
      description: description,
      completed: false,
      updatedAt: new Date().toISOString(),
      userId: ""
    };
    task = await taskService.updateTask(task);
    callback(null, { statusCode: 200, body: JSON.stringify(task) });
  } catch (error) {
    console.error('Error updating task:', error);
    callback(null, { statusCode: 500, body: JSON.stringify({ error: 'Failed to update task' }) });
  }
};

export const deleteTask = async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
  try {
    const { id } = event.pathParameters || {};
    await taskService.deleteTask(id || '');
    callback(null, { statusCode: 200, body: JSON.stringify({ message: 'Task deleted successfully' }) });
  } catch (error) {
    console.error('Error deleting task:', error);
    callback(null, { statusCode: 500, body: JSON.stringify({ error: 'Failed to delete task' }) });
  }
};