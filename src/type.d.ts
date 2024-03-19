import User from './models/schemas/User.schemas'
import { Request } from 'express'
import { DecodedTokenType } from './types/token.type'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: DecodedTokenType
    decoded_refresh_token?: DecodedTokenType
    decoded_email_verify_token?: DecodedTokenType
    decoded_forgot_password_token?: DecodedTokenType
  }
}
