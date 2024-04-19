import User from '~/models/schemas/User.schema'
import databaseService from './db.service'
import { UserRegister, UserUpdateMeBody } from '~/types/user.type'
import hashPassword from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import axios from 'axios'
import { ErrorWithStatus } from '~/models/Error'
import httpStatusCode from '~/constants/httpStatus'
import { generateRandomPassword } from '~/utils/utils'
import { DecodedTokenType } from '~/types/token.type'
import envConfig from '~/constants/envConfig'

class UsersService {
  async signAccessToken(user_id: ObjectId) {
    return await signToken(
      { user_id, tokenType: TokenType.ACCESS_TOKEN },
      envConfig.jwtAccessTokenPrivateKey,
      envConfig.jwtAccessTokenExpiredTime
    )
  }

  async signRefreshToken(user_id: ObjectId) {
    return await signToken(
      { user_id, tokenType: TokenType.REFRESH_TOKEN },
      envConfig.jwtRefreshTokenPrivateKey,
      envConfig.jwtRefreshTokenExpiredTime
    )
  }

  async signEmailVerifyToken(user_id: ObjectId) {
    return await signToken(
      { user_id, tokenType: TokenType.EMAIL_VERIFY_TOKEN },
      envConfig.jwtVerifyEmailTokenPrivateKey,
      envConfig.jwtVerifyEmailTokenExpiredTime
    )
  }

  async signForgotPasswordToken(user_id: ObjectId) {
    return await signToken(
      { user_id, tokenType: TokenType.FORGOT_PASSWORD_TOKEN },
      envConfig.jwtForgotPasswordTokenPrivateKey,
      envConfig.jwtForgotPasswordTokenExpiredTime
    )
  }

  private async signAccessAndRefreshToken(user_id: ObjectId) {
    return await Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: envConfig.googleClientId,
      client_secret: envConfig.googleClientSecret,
      redirect_uri: envConfig.googleAuthorizedRedirectUri,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      id_token: string
      access_token: string
    }
  }

  private async getGoogleUser({ id_token, access_token }: { id_token: string; access_token: string }) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
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

  async loginWithGoogle(code: string) {
    const { access_token, id_token } = await this.getOauthGoogleToken(code)
    const { email, verified_email, name, picture } = await this.getGoogleUser({ access_token, id_token })

    // Check if gmail is not verified
    if (!verified_email) {
      throw new ErrorWithStatus(httpStatusCode.BAD_REQUEST, 'Gmail is not verified')
    }

    const user = await databaseService.user.findOne({ email })
    if (user) {
      const { accessToken, refreshToken } = await this.login(user._id)
      return { accessToken, refreshToken }
    } else {
      const result = await databaseService.user.insertOne(
        new User({
          email,
          name,
          date_of_birth: new Date(),
          password: hashPassword(generateRandomPassword(10)),
          avatar: picture,
          verify: UserVerifyStatus.Verified
        })
      )
      const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(result.insertedId)

      // save new refreshToken to database
      await databaseService.refreshToken.insertOne(
        new RefreshToken({ user_id: result.insertedId, token: refreshToken })
      )

      return { accessToken, refreshToken }
    }
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

  async refreshToken(decodedToken: DecodedTokenType) {
    const { user_id: userId, exp } = decodedToken
    const user_id = new ObjectId(userId)
    const expiresIn = Math.floor((exp as number) - new Date().getTime() / 1000)

    const [refreshToken, accessToken] = await Promise.all([
      signToken({ user_id, tokenType: TokenType.REFRESH_TOKEN }, envConfig.jwtRefreshTokenPrivateKey, expiresIn),
      this.signAccessToken(user_id),
      // delete old refreshToken if have and save new refreshToken to database
      databaseService.refreshToken.deleteOne({ user_id })
    ])
    await databaseService.refreshToken.insertOne(new RefreshToken({ user_id, token: refreshToken }))
    return { accessToken, refreshToken }
  }
}

const userService = new UsersService()
export default userService
