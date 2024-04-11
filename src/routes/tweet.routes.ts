import { Router } from 'express'
import {
  createTweetController,
  getNewsFeedController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  paginationValidator,
  tweetIdValidator,
  tweetTypeValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoginMiddleware, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const tweetsRoute = Router()

/**
 * Description: Create tweet
 * Path: /
 * Method: POST
 * Headers: {Authorization: Bearer token}
 * Body: CreateTweetReqBody
 */
tweetsRoute.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 * Description: Get tweet
 * Path: /:tweet_id
 * Method: GET
 * Headers: {Authorization: Bearer token} or not
 */
tweetsRoute.get(
  '/:tweet_id',
  isUserLoginMiddleware(accessTokenValidator),
  isUserLoginMiddleware(verifyUserValidator),
  tweetIdValidator,
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

/**
 * Description: Get tweet children
 * Path: /:tweet_id/children
 * Method: GET
 * Headers: {Authorization: Bearer token} or not
 * Query Parameters: page, limit, tweet_type
 */
tweetsRoute.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  tweetTypeValidator,
  isUserLoginMiddleware(accessTokenValidator),
  isUserLoginMiddleware(verifyUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)

/**
 * Description: Get news feed
 * Path: /
 * Method: GET
 * Headers: {Authorization: Bearer token}
 * Query Parameters: page, limit,
 */
tweetsRoute.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getNewsFeedController)
)

export default tweetsRoute
