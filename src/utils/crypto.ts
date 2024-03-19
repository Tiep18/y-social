import crypto from 'crypto'
import { config } from 'dotenv'
config()

const hashPassword = (password: string) => {
  return crypto
    .createHash('sha256')
    .update(password + process.env.HASH_PASSWORD_SECRET_KEY)
    .digest('hex')
}

export default hashPassword
