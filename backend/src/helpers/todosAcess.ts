import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosAtIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    logger.info(`Start getting all todos of userId: ${userId}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()
    const items = result.Items

    logger.info(`End get todos`)
    return items as TodoItem[]
  }

  async getTodoById(userId: string, todoId: string): Promise<TodoItem> {
    logger.info('Start get todo by id', { todoId })
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    logger.info('End get todo by id')

    if (result.Item) {
      return result.Item as TodoItem
    }
  
    return null
  }

  async createTodo(todo: TodoItem) {
    logger.info('Start create todo')

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()
    logger.info('End create todo')
  }

  async deleteTodo(userId: string, todoId: string) {
    logger.info('Start delete dotoId', { todoId })

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
  }

  async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate) {
    logger.info('Start update todoId', { todoId })

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done
        }
      })
      .promise()

      logger.info('End update todo')
  }

  async updateTodoAttachmentUrl(userId, todoId: string , attachmentUrl: string) {
    logger.info('Start update attachment url of todoId', {todoId})
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }

}
