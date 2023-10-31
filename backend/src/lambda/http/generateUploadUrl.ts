import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import * as uuid from 'uuid'
import { createAttachmentPresignedUrl, updateTodoAttachmentUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Start create presigned url')
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const attachmentId = uuid.v4()
    const uploadUrl = await createAttachmentPresignedUrl(attachmentId)
    await updateTodoAttachmentUrl(userId, todoId, attachmentId)
    logger.info('End create presigned url')
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl
      })
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
