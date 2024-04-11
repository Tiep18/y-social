import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from './media.type'

export interface CreateTweetReqBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string // chỉ null khi tweet là tweet gốc,
  hashtags: string[] | []
  mentions: string[] | [] // user_id[]
  medias: Media[] | []
}
