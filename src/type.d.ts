import User from './models/schemas/User.schema'
import { Request } from 'express'
import { DecodedTokenType } from './types/token.type'
import Tweet from './models/schemas/Tweet.schema'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: DecodedTokenType
    decoded_refresh_token?: DecodedTokenType
    decoded_email_verify_token?: DecodedTokenType
    decoded_forgot_password_token?: DecodedTokenType
    tweet?: Tweet
  }
}
