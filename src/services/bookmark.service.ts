import { ObjectId } from 'mongodb'
import databaseService from './db.service'
import Bookmark from '~/models/schemas/Bookmark.schema'

class BookmarkService {
  async bookmarkTweet(user_id: ObjectId, tweet_id: ObjectId) {
    const result = await databaseService.bookmark.findOneAndUpdate(
      {
        user_id,
        tweet_id
      },
      {
        $setOnInsert: new Bookmark({ tweet_id, user_id, created_at: new Date() })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result
  }

  async unbookmarkTweet(bookmark_id: ObjectId) {
    await databaseService.bookmark.findOneAndDelete({ _id: bookmark_id })
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService
