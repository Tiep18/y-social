import { Router } from 'express'
import { bookmarkTweetController, unbookmarkTweetController } from '~/controllers/boolmarks.controllers'
import { tweetIdValidator, unbookmarkTweetValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'
const bookmarkRoute = Router()

/**
 * Description: Bookmark tweet
 * Path: /
 * Method: POST
 * Body: {tweet_id: ObjectId}
 * Header: {Authentication: Bearer token}
 */
bookmarkRoute.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController)
)

/**
 * Description: Unbookmark tweet
 * Path: /:bookmark_id
 * Method: DELETE
 * Header: {Authentication: Bearer token}
 */
bookmarkRoute.delete(
  '/:bookmark_id',
  accessTokenValidator,
  verifyUserValidator,
  unbookmarkTweetValidator,
  wrapRequestHandler(unbookmarkTweetController)
)

export default bookmarkRoute
