import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { paginationValidator, searchTweetValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const searchRoute = Router()

/**
 * Description: Search tweet
 * Path: /
 * Method: GET
 * Header: {Authentication: Bearer token}
 */
searchRoute.get(
  '/',
  paginationValidator,
  searchTweetValidator,
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(searchController)
)

export default searchRoute
