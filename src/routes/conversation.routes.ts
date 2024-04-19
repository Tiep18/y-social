import { Router } from 'express'
import { getConversationsControllers } from '~/controllers/conversations.controllers'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, receiverIdValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'
const conversationRoute = Router()

/**
 * Description: Get conversations
 * Path: /receivers/:receiverId
 * Method: GET
 * Header: {Authentication: Bearer token}
 */
conversationRoute.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  receiverIdValidator,
  wrapRequestHandler(getConversationsControllers)
)

export default conversationRoute
