import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TokenType } from '~/constants/enum'
import { DecodedTokenType } from '~/types/token.type'
import { config } from 'dotenv'

config()

export interface SignTokenPayload {
  user_id: ObjectId
  tokenType: TokenType
}

export const signToken = (payload: SignTokenPayload, privateKey: string, expiresIn: string | number) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey as string, { algorithm: 'HS256', expiresIn }, function (err, token) {
      if (err) {
        reject(err)
      }

      resolve(token as string)
    })
  })
}

export const verifyToken = (token: string, privateKey: string) => {
  return new Promise<DecodedTokenType>((resolve, reject) => {
    jwt.verify(token, privateKey as string, function (error, decoded) {
      if (error) {
        reject(error)
      }
      resolve(decoded as DecodedTokenType)
    })
  })
}
