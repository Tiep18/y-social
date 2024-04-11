import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import bookmarkService from '~/services/bookmark.service'
import { BookmarkTweetReqBody } from '~/types/bookmark.type'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response
) => {
  const user_id = new ObjectId(req.decoded_authorization?.user_id)
  const tweet_id = new ObjectId(req.body.tweet_id)
  const result = await bookmarkService.bookmarkTweet(user_id, tweet_id)
  return res.json({
    message: 'Bookmark tweet successfully',
    result
  })
}

export const unbookmarkTweetController = async (req: Request, res: Response) => {
  const bookmark_id = new ObjectId(req.params.bookmark_id)
  await bookmarkService.unbookmarkTweet(bookmark_id)
  return res.json({
    message: 'Unbookmark tweet successfully'
  })
}
