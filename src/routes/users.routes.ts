import { Router } from 'express'
import {
  emailVerifyController,
  followController,
  forgotPasswordController,
  getMecontroller,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resetPasswordController,
  sendEmailVerifyController,
  unfollowController,
  updateMeController
} from '~/controllers/users.controllers'
import { filterResquestBody } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  followUserValidator,
  forgotPasswordlValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  tokenVerifyEmailValidator,
  updateUserValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { UserUpdateMeBody } from '~/types/user.type'
import { wrapRequestHandler } from '~/utils/handler'

const usersRoute = Router()

/**
 * Description: Login route
 * Path: /login
 * Method: POST
 * Body: {email: string, password: string}
 */
usersRoute.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description: Register route
 * Path: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601Date}
 */
usersRoute.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Send email verify route
 * Path: /send-email-verify
 * Method: POST
 * Headers: {Authorization: Bearer <access_token>}
 */
usersRoute.post('/send-email-verify', accessTokenValidator, wrapRequestHandler(sendEmailVerifyController))

/**
 * Description: Verify email route
 * Path: /verify-email
 * Method: POST
 * Body: {token_verify_email: string}
 */
usersRoute.post('/verify-email', tokenVerifyEmailValidator, wrapRequestHandler(emailVerifyController))

/**
 * Description: Send a link with the forgot_password_token to email of user
 * Path: /forgot-password
 * Method: POST
 * Body: {email: string}
 */
usersRoute.post('/forgot-password', forgotPasswordlValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Reset the password of user
 * Path: /reset-password
 * Method: POST
 * Body: {forgot_password_string: string, password: string}, confirm_password: string }
 */
usersRoute.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Description: get me
 * Path: /me
 * Method: GET
 * Headers: {Authorization: Bearer <access_token>}
 */
usersRoute.get('/me', accessTokenValidator, wrapRequestHandler(getMecontroller))

/**
 * Description: update user info
 * Path: /me
 * Method: PATCH
 * Headers: {Authorization: Bearer <access_token>}
 * Body: UserSchema
 */
usersRoute.patch(
  '/me',
  accessTokenValidator,
  verifyUserValidator,
  filterResquestBody<UserUpdateMeBody>([
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'name',
    'website'
  ]),
  updateUserValidator,
  wrapRequestHandler(updateMeController)
)

/**
 * Description: follow someone
 * Path: /follow
 * Method: PUSH
 * Headers: {Authorization: Bearer <access_token>}
 * Body: {followed_user_id: string}
 */
usersRoute.post('/follow', accessTokenValidator, followUserValidator, wrapRequestHandler(followController))

/**
 * Description: unfollow someone
 * Path: /unfollow
 * Method: DELETE
 * Headers: {Authorization: Bearer <access_token>}
 * Body: {followed_user_id: string}
 */
usersRoute.delete('/unfollow', accessTokenValidator, followUserValidator, wrapRequestHandler(unfollowController))

/**
 * Description: Logout route
 * Path: /logout
 * Method: POST
 * Headers: {Authorization: Bearer <access_token>}
 * Body: {refresh_token: string}
 */
usersRoute.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: Refresh access_token route
 * Path: /refresh-token
 * Method: POST
 * Body: {refresh_token: string}
 */
usersRoute.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

export default usersRoute
