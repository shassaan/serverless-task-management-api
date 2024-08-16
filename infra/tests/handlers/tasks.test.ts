import { createTask, updateTask, deleteTask } from '../../src/handlers/tasks';
import taskService from '../../src/services/taskService';
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

jest.mock('../../src/services/taskService');

describe('Tasks Integration Tests', () => {
    let event: Partial<APIGatewayProxyEvent>;
    let context: Partial<Context>;
    let callback: jest.Mock;

    beforeEach(() => {
        event = {
            body: JSON.stringify({ title: 'Test Task', description: 'This is a test task' }),
            pathParameters: { id: '1' }
        };
        context = {};
        callback = jest.fn();
    });

    it('should create a new task successfully', async () => {
        const mockTask = {
            id: '1',
            title: 'Test Task',
            description: 'This is a test task',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'user-123',
        };

        const taskServiceMock = taskService as jest.Mocked<typeof taskService>;
        taskServiceMock.prototype.createTask = jest.fn().mockResolvedValue(mockTask);

        await createTask(event as APIGatewayProxyEvent, context as Context, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            statusCode: 200,
            body: JSON.stringify(mockTask),
        });
    });

    it('should return an error if task creation fails', async () => {
        const taskServiceMock = taskService as jest.Mocked<typeof taskService>;
        taskServiceMock.prototype.createTask = jest.fn().mockRejectedValue(new Error('Task creation failed'));

        await createTask(event as APIGatewayProxyEvent, context as Context, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create task' }),
        });
    });

    it('should update a task successfully', async () => {
        const mockTask = {
            id: '1',
            title: 'Updated Task',
            description: 'This is an updated test task',
            completed: false,
            updatedAt: new Date().toISOString(),
            userId: 'user-123',
        };

        const taskServiceMock = taskService as jest.Mocked<typeof taskService>;
        taskServiceMock.prototype.updateTask = jest.fn().mockResolvedValue(mockTask);

        event.body = JSON.stringify({ title: 'Updated Task', description: 'This is an updated test task' });

        await updateTask(event as APIGatewayProxyEvent, context as Context, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            statusCode: 200,
            body: JSON.stringify(mockTask),
        });
    });

    it('should return an error if task update fails', async () => {
        const taskServiceMock = taskService as jest.Mocked<typeof taskService>;
        taskServiceMock.prototype.updateTask  = jest.fn().mockImplementation(()=>{ Promise.reject(new Error('Task update failed'))});

        event.body = JSON.stringify({ title: 'Updated Task', description: 'This is an updated test task' });

        await updateTask(event as APIGatewayProxyEvent, context as Context, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update task' }),
        });
    });

    it('should delete a task successfully', async () => {
        const taskServiceMock = taskService as jest.Mocked<typeof taskService>;
        taskServiceMock.prototype.deleteTask = jest.fn().mockResolvedValue(true);

        await deleteTask(event as APIGatewayProxyEvent, context as Context, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            statusCode: 200,
            body: JSON.stringify({ message: 'Task deleted successfully' }),
        });
    });

    it('should return an error if task deletion fails', async () => {
        const taskServiceMock = taskService as jest.Mocked<typeof taskService>;
        taskServiceMock.prototype.deleteTask = jest.fn().mockRejectedValue(new Error('Task deletion failed'));

        await deleteTask(event as APIGatewayProxyEvent, context as Context, callback);

        expect(callback).toHaveBeenCalledWith(null, {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete task' }),
        });
    });
});