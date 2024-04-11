import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '~/types/media.type'

export interface TweetInterface {
  _id?: ObjectId
  user_id?: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId // chỉ null khi tweet là tweet gốc,
  hashtags?: ObjectId[]
  mentions?: ObjectId[]
  medias?: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
}

export default class Tweet {
  _id?: ObjectId
  user_id?: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId // chỉ null khi tweet là tweet gốc,
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
  constructor({
    _id,
    audience,
    content,
    guest_views,
    hashtags,
    medias,
    mentions,
    parent_id,
    type,
    user_id,
    user_views
  }: TweetInterface) {
    const now = new Date()
    this._id = _id
    this.audience = audience
    this.content = content
    this.created_at = now
    this.updated_at = now
    this.guest_views = guest_views || 0
    this.mentions = mentions || []
    this.parent_id = parent_id
    this.type = type
    this.user_id = user_id
    this.hashtags = hashtags || []
    this.medias = medias || []
    this.user_views = user_views || 0
  }
}
