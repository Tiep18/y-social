import crypto from 'crypto'
import envConfig from '~/constants/envConfig'

const hashPassword = (password: string) => {
  return crypto
    .createHash('sha256')
    .update(password + envConfig.hashPasswordSecretKey)
    .digest('hex')
}

export default hashPassword
