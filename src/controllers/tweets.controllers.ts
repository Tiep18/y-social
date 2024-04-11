import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { TweetType } from '~/constants/enum'
import tweetService from '~/services/tweet.service'
import { CreateTweetReqBody } from '~/types/tweet.type'

export const createTweetController = async (req: Request<ParamsDictionary, any, CreateTweetReqBody>, res: Response) => {
  const user_id = new ObjectId(req.decoded_authorization?.user_id)
  const result = await tweetService.createTweet(user_id, req.body)
  return res.json({
    message: 'Create tweet successfully',
    result
  })
}

export const getTweetController = async (req: Request, res: Response) => {
  const result = await tweetService.increaseView(req.tweet?._id as any, req.decoded_authorization?.user_id)

  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }
  return res.json({
    message: 'Get tweet successfully',
    result: tweet
  })
}

export const getTweetChildrenController = async (req: Request, res: Response) => {
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const tweet_type = Number(req.query.tweet_type) as TweetType
  const user_id = req.decoded_authorization?.user_id
  const { tweets, total } = await tweetService.getTweetChildren({
    parent_id: new ObjectId(req.tweet?._id),
    tweet_type,
    limit,
    page,
    user_id
  })

  return res.json({
    message: 'Get tweet children successfully',
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}

export const getNewsFeedController = async (req: Request, res: Response) => {
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const user_id = new ObjectId(req.decoded_authorization?.user_id)
  const { total, tweets } = await tweetService.getNewsFeed({
    limit,
    page,
    user_id
  })
  return res.json({
    message: 'Get news feed successfully',
    result: {
      tweets,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}
