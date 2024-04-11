import { ObjectId } from 'mongodb'
import databaseService from './db.service'
import Like from '~/models/schemas/Like.schema'

class LikeService {
  async likeTweet(user_id: ObjectId, tweet_id: ObjectId) {
    const result = await databaseService.like.findOneAndUpdate(
      {
        user_id,
        tweet_id
      },
      {
        $setOnInsert: new Like({ tweet_id, user_id, created_at: new Date() })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result
  }

  async dislikeTweet(like_id: ObjectId) {
    await databaseService.like.findOneAndDelete({ _id: like_id })
  }
}

const likeService = new LikeService()
export default likeService
