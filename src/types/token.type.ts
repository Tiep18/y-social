import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TokenType } from '~/constants/enum'

export interface DecodedTokenType extends jwt.JwtPayload {
  user_id: string
  tokenType: TokenType
}
