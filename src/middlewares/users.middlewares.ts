import { Request, Response, NextFunction } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import httpStatusCode from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/db.service'
import userService from '~/services/users.service'
import hashPassword from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import validate from '~/utils/validation'
import { config } from 'dotenv'
import { UserVerifyStatus } from '~/constants/enum'

config()

const passwordSchema: ParamSchema = {
  isString: true,
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: 'Password must be at least 6 character and not more than 50 characters'
  },
  isStrongPassword: {
    options: {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: 'Password must be at least contains a lowercase, an uppercase, a number and a symbol'
  }
}

const confirmPasswordSchema: ParamSchema = {
  isString: true,
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: 'Password confirmation must be at least 6 character and not more than 50 characters'
  },
  isStrongPassword: {
    options: {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: 'Password confirmation must be at least contains a lowercase, an uppercase, a number and a symbol'
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match the password')
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: 'Name must not be empty'
  },
  isString: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: 'Name must be at least one character and not more than 100 characters'
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: {
    errorMessage: 'Date of birth must not be empty'
  },
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: 'Date of birth must be a valid ISO8601 string'
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: 'Email must not be empty'
        },
        isEmail: {
          errorMessage: 'Email invalid'
        },
        isLength: {
          errorMessage: 'Email must be at least 5 character and not more than 50 characters',
          options: {
            min: 5,
            max: 100
          }
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.user.findOne({ email: value, password: hashPassword(req.body.password) })
            if (!user) throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Email or password incorrect')

            req.user = user
            return true
          }
        }
      },
      password: {
        isString: true,
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: 'Password must be at least 6 character and not more than 50 characters'
        },
        isStrongPassword: {
          options: {
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: 'Password must be at least contains a lowercase, an uppercase, a number and a symbol'
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        notEmpty: {
          errorMessage: 'Email must not be empty'
        },
        isEmail: {
          errorMessage: 'Email invalid'
        },
        isLength: {
          errorMessage: 'Email must be at least 5 character and not more than 50 characters',
          options: {
            min: 5,
            max: 100
          }
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isEmailExist = await userService.isEmailExist(value)
            if (isEmailExist) throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Email already exists')
            return true
          }
        }
      },
      date_of_birth: dateOfBirthSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value) throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Authorization header is required')
            const accessToken = value.split(' ')[1]
            if (!accessToken) throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Access token is required')
            try {
              const decoded_authorization = await verifyToken(
                accessToken,
                process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY as string
              )
              req.decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus(
                httpStatusCode.UNAUTHORIZED,
                'Access token ' + (error as JsonWebTokenError).message
              )
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value) throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Refresh token is required')
            try {
              const [decoded_refresh_token, refreshToken] = await Promise.all([
                verifyToken(value, process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY as string),
                databaseService.refreshToken.findOne({ token: value })
              ])
              if (!refreshToken)
                throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Used refresh token or not exist')
              req.decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError)
                throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Refresh token: ' + error.message)
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tokenVerifyEmailValidator = validate(
  checkSchema(
    {
      token_verify_email: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value) throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Token verify email is required')
            try {
              const decoded_email_verify_token = await verifyToken(
                value,
                process.env.JWT_VERIFY_EMAIL_TOKEN_PRIVATE_KEY as string
              )
              const user = await databaseService.user.findOne({ _id: new ObjectId(decoded_email_verify_token.user_id) })
              if (value !== user?.email_verify_token)
                throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Email verify token in incorrect')

              req.decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError)
                throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Token verify email: ' + error.message)
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordlValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: 'Email must not be empty'
        },
        isEmail: {
          errorMessage: 'Email invalid'
        },
        isLength: {
          errorMessage: 'Email must be at least 5 character and not more than 50 characters',
          options: {
            min: 5,
            max: 100
          }
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.user.findOne({ email: value })
            if (!user) throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'User not found')

            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value) throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Forgot password token is required')
            try {
              const decoded_forgot_password_token = await verifyToken(
                value,
                process.env.JWT_FORGOT_PASSWORD_TOKEN_PRIVATE_KEY as string
              )
              const user = await databaseService.user.findOne({
                _id: new ObjectId(decoded_forgot_password_token.user_id)
              })
              if (value !== user?.forgot_password_token)
                throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Invalid forgot password token')

              req.decoded_forgot_password_token = decoded_forgot_password_token
            } catch (error) {
              if (error instanceof JsonWebTokenError)
                throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Forgot password token: ' + error.message)
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  const user = await databaseService.user.findOne({ _id: new ObjectId(req.decoded_authorization?.user_id) })
  if (user?.verify !== UserVerifyStatus.Verified) {
    return next(new ErrorWithStatus(httpStatusCode.FORBIDDEN, 'User not verified'))
  }
  next()
}

export const updateUserValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true,
        notEmpty: undefined
      },
      bio: {
        trim: true,
        optional: true,
        isString: {
          errorMessage: 'Bio must be a string'
        },
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: 'Bio must be at least one character and not more than 200 characters'
        }
      },
      location: {
        trim: true,
        optional: true,
        isString: {
          errorMessage: 'Location must be a string'
        },
        isLength: {
          options: {
            min: 6,
            max: 100
          },
          errorMessage: 'Location must be at least 6 characters and not more than 100 characters'
        }
      },
      website: {
        trim: true,
        optional: true,
        isString: {
          errorMessage: 'Website must be a string'
        },
        isLength: {
          options: {
            min: 6,
            max: 100
          },
          errorMessage: 'Website must be at least 6 characters and not more than 100 characters'
        }
      },
      avatar: {
        trim: true,
        optional: true,
        isString: {
          errorMessage: 'Avatar must be a string'
        },
        isLength: {
          options: {
            min: 6,
            max: 400
          },
          errorMessage: 'Avatar must be at least 6 characters and not more than 400 characters'
        }
      },
      cover_photo: {
        trim: true,
        optional: true,
        isString: {
          errorMessage: 'Cover photo must be a string'
        },
        isLength: {
          options: {
            min: 6,
            max: 400
          },
          errorMessage: 'Cover photo must be at least 6 characters and not more than 400 characters'
        }
      }
    },
    ['body']
  )
)

export const followUserValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        trim: true,
        notEmpty: {
          errorMessage: 'Followed user id is required'
        },
        isString: {
          errorMessage: 'Followed user id must be a string'
        },
        custom: {
          options: async (value, { req }) => {
            if (value === (req as Request).decoded_authorization?.user_id) {
              throw new ErrorWithStatus(httpStatusCode.BAD_REQUEST, 'You cannot follow yourself')
            }
            const user = await databaseService.user.findOne({ _id: new ObjectId(value) })

            if (!user) {
              throw new ErrorWithStatus(httpStatusCode.BAD_REQUEST, 'Invalid followed user id')
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const unfollowUserValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        trim: true,
        notEmpty: {
          errorMessage: 'Followed user id is required'
        },
        isString: {
          errorMessage: 'Followed user id must be a string'
        },
        custom: {
          options: async (value, { req }) => {
            if (value === (req as Request).decoded_authorization?.user_id) {
              throw new ErrorWithStatus(httpStatusCode.BAD_REQUEST, 'You cannot unfollow yourself')
            }
            const user = await databaseService.user.findOne({ _id: new ObjectId(value) })

            if (!user) {
              throw new ErrorWithStatus(httpStatusCode.BAD_REQUEST, 'Followed user not found')
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
