import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schemas'
import userService from '~/services/users.service'
import {
  UserForgotPasswordBody,
  UserLogin,
  UserLogout,
  UserRegister,
  UserResetPasswordBody,
  UserUpdateMeBody,
  UserVerifyEmail
} from '~/types/user.type'

export const loginController = async (req: Request<ParamsDictionary, any, UserLogin>, res: Response) => {
  const user = req.user as User
  const result = await userService.login(user?._id as ObjectId)
  return res.json({ message: 'Login successful', data: result })
}

export const registerController = async (req: Request<ParamsDictionary, any, UserRegister>, res: Response) => {
  const result = await userService.register(req.body)
  return res.json({ message: 'Register successful', data: result })
}

export const logoutController = async (req: Request<ParamsDictionary, any, UserLogout>, res: Response) => {
  await userService.logout(req.body.refresh_token)
  return res.json({ message: 'Logout successful' })
}

export const sendEmailVerifyController = async (req: Request, res: Response) => {
  const result = await userService.sendEmailVerify(new ObjectId(req.decoded_authorization?.user_id))
  return res.json({ message: result })
}

export const emailVerifyController = async (req: Request<ParamsDictionary, any, UserVerifyEmail>, res: Response) => {
  await userService.verifyEmail(new ObjectId(req.decoded_email_verify_token?.user_id))
  return res.json({ message: 'Email is verified successfully' })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, UserForgotPasswordBody>,
  res: Response
) => {
  const result = await userService.forgotPassword(new ObjectId(req.user?._id))
  return res.json({ message: result })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, UserResetPasswordBody>,
  res: Response
) => {
  const result = await userService.resetPassword(
    new ObjectId(req.decoded_forgot_password_token?.user_id),
    req.body.password
  )
  return res.json({ message: result })
}

export const getMecontroller = async (req: Request, res: Response) => {
  const user = await userService.getMe(new ObjectId(req.decoded_authorization?.user_id))
  return res.json({ message: 'Get user successful', result: user })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UserUpdateMeBody>, res: Response) => {
  const user = await userService.updateMe({
    user_id: new ObjectId(req.decoded_authorization?.user_id),
    payload: req.body
  })
  return res.json({ message: 'Update successful', result: user })
}