import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'

interface UserType {
  _id?: ObjectId
  email: string
  password: string
  name: string
  date_of_birth: Date
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string
  forgot_password_token?: string
  verify?: UserVerifyStatus
  twitter_circle?: ObjectId[]
  bio?: string
  location?: string
  website?: string
  avatar?: string
  cover_photo?: string
}

export default class User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  date_of_birth: Date
  created_at: Date
  updated_at: Date
  email_verify_token: string
  forgot_password_token: string
  verify: UserVerifyStatus
  twitter_circle: ObjectId[]
  bio: string
  location: string
  website: string
  avatar: string
  cover_photo: string

  constructor(user: UserType) {
    this._id = user._id
    this.email = user.email
    this.created_at = user.created_at || new Date()
    this.updated_at = user.updated_at || new Date()
    this.email_verify_token = user.email_verify_token || ''
    this.password = user.password
    this.name = user.name || ''
    this.date_of_birth = user.date_of_birth || new Date()
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.twitter_circle = user.twitter_circle || []
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
  }
}
