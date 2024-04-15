import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import searchService from '~/services/search.service'
import { BookmarkTweetReqBody } from '~/types/bookmark.type'

export const searchController = async (req: Request, res: Response) => {
  const user_id = new ObjectId(req.decoded_authorization?.user_id)
  const content = req.query.content as string
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const media_type = Number(req.query.media_type)
  const people_followed = Number(req.query.people_followed)
  const result = await searchService.searchTweet({
    limit,
    page,
    content,
    media_type,
    people_followed,
    user_id
  })
  return res.json({
    message: 'Search tweets successfully',
    result: {
      result,
      limit,
      page
      // total_page: Math.ceil(total / limit)
    }
  })
}
