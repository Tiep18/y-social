import { Router } from 'express'
import { loginWithGoogleController } from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handler'
const oauthRoute = Router()

/**
 * Description: Login route
 * Path: /login
 * Method: POST
 * Body: {email: string, password: string}
 */
oauthRoute.get('/oauth/google', wrapRequestHandler(loginWithGoogleController))

export default oauthRoute
