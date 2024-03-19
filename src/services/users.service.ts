import User from '~/models/schemas/User.schemas'
import databaseService from './db.service'
import { UserRegister, UserUpdateMeBody } from '~/types/user.type'
import hashPassword from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import { config } from 'dotenv'
import Follower from '~/models/schemas/Follower.schemas'

config()

class UsersService {
  async signAccessToken(user_id: ObjectId) {
    return await signToken(
      { user_id, tokenType: TokenType.ACCESS_TOKEN },
      process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY as string,
      process.env.JWT_ACCESS_TOKEN_EXPRID_TIME as string
    )
  }

  async signRefreshToken(user_id: ObjectId) {
    return await signToken(
      { user_id, tokenType: TokenType.REFRESH_TOKEN },
      process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY as string,
      process.env.JWT_REFRESH_TOKEN_EXPRID_TIME as string
    )
  }

  async signEmailVerifyToken(user_id: ObjectId) {
    return await signToken(
      { user_id, tokenType: TokenType.EMAIL_VERIFY_TOKEN },
      process.env.JWT_VERIFY_EMAIL_TOKEN_PRIVATE_KEY as string,
      process.env.JWT_VERIFY_EMAIL_TOKEN_EXPRID_TIME as string
    )
  }

  async signForgotPasswordToken(user_id: ObjectId) {
    return await signToken(
      { user_id, tokenType: TokenType.FORGOT_PASSWORD_TOKEN },
      process.env.JWT_FORGOT_PASSWORD_TOKEN_PRIVATE_KEY as string,
      process.env.JWT_FORGOT_PASSWORD_TOKEN_EXPRID_TIME as string
    )
  }

  private async signAccessAndRefreshToken(user_id: ObjectId) {
    return await Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: UserRegister) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    const result = await databaseService.user.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(result.insertedId)

    // save new refreshToken to database
    await databaseService.refreshToken.insertOne(new RefreshToken({ user_id: result.insertedId, token: refreshToken }))

    //Send email heare
    console.log(email_verify_token)

    return { accessToken, refreshToken }
  }

  async login(user_id: ObjectId) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(user_id)

    // delete old refreshToken if have and save new refreshToken to database
    await databaseService.refreshToken.deleteOne({ user_id })
    await databaseService.refreshToken.insertOne(new RefreshToken({ user_id, token: refreshToken }))

    return { accessToken, refreshToken }
  }

  async logout(refreshToken: string) {
    await databaseService.refreshToken.deleteOne({ token: refreshToken })
  }

  async isEmailExist(email: string) {
    const user = await databaseService.user.findOne({ email })
    return Boolean(user)
  }

  async sendEmailVerify(userId: ObjectId) {
    const user = (await databaseService.user.findOne({ _id: userId })) as User

    let emailVerifyToken = user?.email_verify_token

    if (user.verify === UserVerifyStatus.Verified) {
      return 'Email verified successfully before'
    }

    if (user.verify === UserVerifyStatus.Unverified) {
      emailVerifyToken = await this.signEmailVerifyToken(userId)
      await databaseService.user.updateOne(
        { _id: userId },
        {
          $set: {
            email_verify_token: emailVerifyToken
            // updated_at: new Date()
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    }
    // Send the email here
    console.log(emailVerifyToken)
    return 'Email is sent'
  }

  async verifyEmail(userId: ObjectId) {
    const res = await databaseService.user.updateOne(
      { _id: userId },
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified
          // updated_at: new Date()d
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  async forgotPassword(userId: ObjectId) {
    const forgot_password_token = await this.signForgotPasswordToken(userId)
    await databaseService.user.updateOne(
      { _id: userId },
      {
        $set: {
          forgot_password_token
          // updated_at: new Date()d
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    //send email here
    console.log(forgot_password_token)
    return 'Email is sent'
  }

  async resetPassword(userId: ObjectId, password: string) {
    await databaseService.user.updateOne(
      { _id: userId },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return 'Reset password successfully'
  }

  async getMe(user_id: ObjectId) {
    const user = await databaseService.user.findOne(
      { _id: user_id },
      {
        projection: {
          password: 0,
          verify: 0,
          forgot_password_token: 0,
          email_verify_token: 0
        }
      }
    )
    return user
  }

  async updateMe({ user_id, payload }: { user_id: ObjectId; payload: UserUpdateMeBody }) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.user.findOneAndUpdate(
      { _id: user_id },
      {
        $set: _payload as UserUpdateMeBody & { date_of_birth?: Date },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          verify: 0,
          forgot_password_token: 0,
          email_verify_token: 0
        }
      }
    )
    return user
  }

  async follow({ user_id, followed_user_id }: { user_id: ObjectId; followed_user_id: ObjectId }) {
    await databaseService.follower.updateOne(
      { user_id, followed_user_id },
      {
        $setOnInsert: {
          created_at: new Date(),
          user_id,
          followed_user_id
        }
      },
      {
        upsert: true
      }
    )
    return 'Followed successfully'
  }

  async unfollow({ user_id, followed_user_id }: { user_id: ObjectId; followed_user_id: ObjectId }) {
    await databaseService.follower.deleteOne({ user_id, followed_user_id })
    return 'Unfollow successfully'
  }
}

const userService = new UsersService()
export default userService
