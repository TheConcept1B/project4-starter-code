import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodoImage } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodoImage')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    logger.info('Start delete todo image', {todoId})
    await deleteTodoImage(userId, todoId)
    logger.info('End delete todo image', {todoId})
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
