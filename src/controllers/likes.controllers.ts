import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import bookmarkService from '~/services/bookmark.service'
import likeService from '~/services/like.service'
import { LikeTweetReqBody } from '~/types/like.type'

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
  const user_id = new ObjectId(req.decoded_authorization?.user_id)
  const tweet_id = new ObjectId(req.body.tweet_id)
  const result = await likeService.likeTweet(user_id, tweet_id)
  return res.json({
    message: 'Like tweet successfully',
    result
  })
}

export const dislikeTweetController = async (req: Request, res: Response) => {
  const like_id = new ObjectId(req.params.like_id)
  await likeService.dislikeTweet(like_id)
  return res.json({
    message: 'Dislike tweet successfully'
  })
}
