import { ObjectId } from 'mongodb'
import databaseService from './db.service'
import { searchTweetAggregate } from '~/utils/aggregate'

class SearchService {
  async searchTweet({
    content,
    limit,
    page,
    user_id,
    people_followed,
    media_type
  }: {
    limit: number
    page: number
    media_type?: number
    people_followed?: number
    content: string
    user_id: ObjectId
  }) {
    let ids
    if (people_followed === 1) {
      const user_followed = await databaseService.follower.find({ user_id }).toArray()
      ids = user_followed.map((item) => item.followed_user_id)
    }
    const tweets = await databaseService.tweet
      .aggregate(
        searchTweetAggregate({
          content,
          limit,
          page,
          user_id,
          people_followed,
          media_type,
          ids
        })
      )
      .toArray()
    return tweets
  }
}

const searchService = new SearchService()
export default searchService
