import { DynamoDB } from 'aws-sdk';
import TaskService from '../../src/services/taskService';
import { Task } from '../../src/models/task';
const tableName = 'test-table';
jest.mock('aws-sdk', () => {
    const mDocumentClient = {
        scan: jest.fn().mockReturnThis(),
        put: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    return { DynamoDB: { DocumentClient: jest.fn(() => mDocumentClient) } };
});

describe('TaskService', () => {
    let taskService: TaskService;
    let documentClientMock: jest.Mocked<DynamoDB.DocumentClient>;

    beforeEach(() => {

        taskService = new TaskService('test-table');
        documentClientMock = new DynamoDB.DocumentClient() as jest.Mocked<DynamoDB.DocumentClient>;
    });

    describe('getTasks', () => {
        it('should return a list of tasks', async () => {
            const params: DynamoDB.DocumentClient.ScanInput = {
                TableName: tableName,
            };
            const tasks: Task[] = [{ id: '1', title: 'Test Task', description: 'This is a test task', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'user-123' }];
            documentClientMock.scan(params).promise = jest.fn().mockResolvedValueOnce({ Items: tasks });

            const result = await taskService.getTasks();

            expect(documentClientMock.scan).toHaveBeenCalledWith({ TableName: tableName });
            expect(result).toEqual(tasks);
        });
    });

    describe('createTask', () => {
        it('should create a task and return it', async () => {
            const task: Task = { id: '1', title: 'Test Task', description: 'This is a test task', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'user-123' };
            const params: DynamoDB.DocumentClient.PutItemInput = {
                TableName: tableName,
                Item: task,
            };
            documentClientMock.put(params).promise = jest.fn().mockResolvedValueOnce({});

            const result = await taskService.createTask(task);

            expect(documentClientMock.put).toHaveBeenCalledWith({
                TableName: tableName,
                Item: task,
            });
            expect(result).toEqual(task);
        });
    });

    describe('updateTask', () => {
        it('should update a task and return it', async () => {
            const task: Task = { id: '1', title: 'Test Task', description: 'This is a test task', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'user-123' };
            const params: DynamoDB.DocumentClient.PutItemInput = {
                TableName: tableName,
                Item: task,
            };
            documentClientMock.put(params).promise = jest.fn().mockResolvedValueOnce({});

            const result = await taskService.updateTask(task);

            expect(documentClientMock.put).toHaveBeenCalledWith({
                TableName: tableName,
                Item: task,
            });
            expect(result).toEqual(task);
        });
    });

});