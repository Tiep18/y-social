import { ObjectId, WithId } from 'mongodb'
import { CreateTweetReqBody } from '~/types/tweet.type'
import databaseService from './db.service'
import Tweet from '~/models/schemas/Tweet.schema'
import { TweetType } from '~/constants/enum'
import { getNewsFeedAggregate, getTotalNewsFeedAggregate, getTweetChildrenAggregate } from '~/utils/aggregate'

class TweetService {
  async checkAndCreateHashTags(hashtags: string[] | []) {
    if (hashtags.length === 0) return []
    const result = await Promise.all(
      hashtags.map((name) => {
        return databaseService.hashtag.findOneAndUpdate(
          {
            name
          },
          {
            $setOnInsert: {
              name: name,
              created_at: new Date()
            }
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return result.map((item) => item?._id)
  }
  async createTweet(user_id: ObjectId, body: CreateTweetReqBody) {
    const { audience, content, hashtags, medias, mentions, parent_id, type } = body
    const hashtagsId = await this.checkAndCreateHashTags(hashtags)
    const result = await databaseService.tweet.insertOne(
      new Tweet({
        user_id,
        audience,
        content,
        medias,
        mentions: mentions.length > 0 ? mentions.map((id) => new ObjectId(id)) : [],
        parent_id: parent_id ? new ObjectId(parent_id) : null,
        type,
        hashtags: hashtagsId as any
      })
    )
    return await databaseService.tweet.findOne({ _id: result.insertedId })
  }

  async increaseView(id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweet.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )

    return result as WithId<{ guest_views: number; user_views: number; updated_at: Date }>
  }

  async getTweetChildren({
    limit,
    page,
    parent_id,
    tweet_type,
    user_id
  }: {
    parent_id: ObjectId
    tweet_type: TweetType
    limit: number
    page: number
    user_id?: string
  }) {
    const tweets = await databaseService.tweet
      .aggregate<Tweet>(
        getTweetChildrenAggregate({
          limit,
          page,
          parent_id,
          tweet_type
        })
      )
      .toArray()

    const now = new Date()
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const ids = tweets.map((tweet) => tweet._id) as ObjectId[]

    const [total] = await Promise.all([
      databaseService.tweet.countDocuments({
        parent_id,
        type: tweet_type
      }),
      // increase view tweet children
      databaseService.tweet.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: now
          }
        }
      )
    ])

    // update tweet to return
    tweets.forEach((tweet) => {
      tweet.updated_at = now
      user_id ? (tweet.user_views += 1) : (tweet.guest_views += 1)
    })

    return { tweets, total }
  }

  async getNewsFeed({ limit, page, user_id }: { limit: number; page: number; user_id: ObjectId }) {
    const followedUsers = await databaseService.follower.find({ user_id }).toArray()
    const ids = followedUsers.map((user) => user.followed_user_id)
    //add user_id to ids
    ids.push(new ObjectId(user_id))

    const [tweets, totalTweets] = await Promise.all([
      databaseService.tweet
        .aggregate<Tweet>(
          getNewsFeedAggregate({
            limit,
            page,
            ids,
            user_id
          })
        )
        .toArray(),
      await databaseService.tweet
        .aggregate(
          getTotalNewsFeedAggregate({
            ids,
            user_id
          })
        )
        .toArray()
    ])

    // increase view tweet children
    const now = new Date()
    const tweetIds = tweets.map((tweet) => tweet._id) as ObjectId[]
    await databaseService.tweet.updateMany(
      {
        _id: {
          $in: tweetIds
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: now
        }
      }
    )

    // update tweet to return
    tweets.forEach((tweet) => {
      tweet.updated_at = now
      tweet.user_views += 1
    })

    return { tweets, total: totalTweets.length }
  }
}

const tweetService = new TweetService()
export default tweetService
