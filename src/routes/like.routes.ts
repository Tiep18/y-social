import { Router } from 'express'
import { dislikeTweetController, likeTweetController } from '~/controllers/likes.controllers'
import { dislikeTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'
const likeRoute = Router()

/**
 * Description: Like tweet
 * Path: /
 * Method: POST
 * Body: {tweet_id: ObjectId}
 * Header: {Authentication: Bearer token}
 */
likeRoute.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
)

/**
 * Description: Dislike tweet
 * Path: /:like_id
 * Method: DELETE
 * Header: {Authentication: Bearer token}
 */
likeRoute.delete(
  '/:like_id',
  accessTokenValidator,
  verifyUserValidator,
  dislikeTweetValidator,
  wrapRequestHandler(dislikeTweetController)
)

export default likeRoute
