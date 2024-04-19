import { config } from 'dotenv'
config()

const envConfig = {
  port: process.env.PORT || 4000,
  clientGoogleOauthRedirect: process.env.CLIENT_GOOGLE_OAUTH_REDIRECT as string,
  jwtAccessTokenPrivateKey: process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY as string,
  jwtRefreshTokenPrivateKey: process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY as string,
  jwtVerifyEmailTokenPrivateKey: process.env.JWT_VERIFY_EMAIL_TOKEN_PRIVATE_KEY as string,
  jwtForgotPasswordTokenPrivateKey: process.env.JWT_FORGOT_PASSWORD_TOKEN_PRIVATE_KEY as string,
  dbUsername: process.env.DB_USERNAME as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbName: process.env.DB_NAME as string,
  jwtAccessTokenExpiredTime: process.env.JWT_ACCESS_TOKEN_EXPIRED_TIME as string,
  jwtRefreshTokenExpiredTime: process.env.JWT_REFRESH_TOKEN_EXPIRED_TIME as string,
  jwtVerifyEmailTokenExpiredTime: process.env.JWT_VERIFY_EMAIL_TOKEN_EXPIRED_TIME as string,
  jwtForgotPasswordTokenExpiredTime: process.env.JWT_FORGOT_PASSWORD_TOKEN_EXPIRED_TIME as string,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleAuthorizedRedirectUri: process.env.GOOGLE_AUTHORIZED_REDIRECT_URI,
  hashPasswordSecretKey: process.env.HASH_PASSWORD_SECRET_KEY
}

export default envConfig
