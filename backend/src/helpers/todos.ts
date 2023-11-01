import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('todos')

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Start get all todos for user', { userId })

  return await todosAccess.getTodosByUserId(userId)
}
export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  logger.info('Start create new todo')
  const todoId = uuid.v4()
  const todo: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }

  await todosAccess.createTodo(todo)
  logger.info('End create new todo')
  return todo
}
export async function deleteTodo(userId: string, todoId: string) {
  logger.info('Start delete todoId', {todoId})

  const todo = await todosAccess.getTodoById(userId, todoId)

  if (!todo) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'todoId is not found!' })
    }  
  }
  todosAccess.deleteTodo(userId, todoId)
  // Delete img file in s3 if exist
  try {
    if (todo.attachmentUrl) {
      await attachmentUtils.deleteObjectS3(todo.attachmentUrl)
    } 
  } catch (error) {
    logger.info('Something went wrong with attachment of todoId ', {todoId})
  } 
  
  logger.info('End delete todoId', {todoId})
}
export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {
  logger.info('Start update todoId', {todoId})

  const todo = await todosAccess.getTodoById(userId, todoId)

  if (!todo) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'todoId is not found!' })
    }  
  }

  todosAccess.updateTodo(userId, todoId, updateTodoRequest) 

  logger.info('End update todoId', {todoId})
}

export async function createAttachmentPresignedUrl(attachmentId: string) {
  logger.info('Create presigned url')
  return await attachmentUtils.getUploadUrl(attachmentId)
}

export async function updateTodoAttachmentUrl(userId: string, todoId: string, attachmentId: string) {
  logger.info('Update attachment url of todoId', {todoId})

  const attachmentUrl = await attachmentUtils.createAttachmentPresignedUrl(attachmentId)
  const todo = await todosAccess.getTodoById(userId, todoId)
  if (!todo) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'todoId is not found!' })
    }  
  }

  await todosAccess.updateTodoAttachmentUrl(userId, todoId, attachmentUrl)
}

export async function deleteTodoImage(userId: string, todoId: string) {
  logger.info('Start delete todo image', {todoId})
 
  const todo = await todosAccess.getTodoById(userId, todoId)
  if (!todo) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'todoId is not found!' })
    }  
  }
  // Delete img url in database
  await todosAccess.deleteImgUrl(userId, todoId)

  // Delete img file in s3 if exist 
  await attachmentUtils.deleteObjectS3(todo.attachmentUrl);

  logger.info('End delete todo image', {todoId})
}