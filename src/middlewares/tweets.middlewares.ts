import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import httpStatusCode from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/db.service'
import { Media } from '~/types/media.type'
import { getTweetDetailAggregate } from '~/utils/aggregate'
import { wrapRequestHandler } from '~/utils/handler'
import { enumNumberToAray } from '~/utils/utils'
import validate from '~/utils/validation'

const tweetTypeOptions = enumNumberToAray(TweetType)
const tweetAudienceOptions = enumNumberToAray(TweetAudience)
const mediaTypes = enumNumberToAray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        notEmpty: {
          errorMessage: 'Tweet type is required'
        },
        isIn: {
          options: [tweetTypeOptions],
          errorMessage: 'Invalid tweet type'
        }
      },
      audience: {
        notEmpty: {
          errorMessage: 'Tweet audience is required'
        },
        isIn: {
          options: [tweetAudienceOptions],
          errorMessage: 'Invalid tweet audience'
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const tweetType = req.body.type
            const hashtags = req.body.hashtags
            const mentions = req.body.mentions
            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(tweetType) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value === ''
            ) {
              throw new Error('Content must be a non-empty string')
            }
            if (tweetType === TweetType.Retweet && value !== '') {
              throw new Error('Content must be a emtpy string')
            }
            return true
          }
        }
      },
      parent_id: {
        custom: {
          options: async (value, { req }) => {
            const tweetType = req.body.type
            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Retweet].includes(tweetType) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error('Parent id invalid: ' + value)
            }

            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Retweet].includes(tweetType) &&
              ObjectId.isValid(value)
            ) {
              const tweet = await databaseService.tweet.findOne({ _id: new ObjectId(value as string) })
              if (!tweet) throw new Error('Parent id not found')
            }

            if (tweetType === TweetType.Tweet && value !== null) {
              throw new Error('Parent id must be null')
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value: string[] | [], { req }) => {
            if (value.length > 0 && value.some((item) => typeof item !== 'string')) {
              throw new Error('Hashtags must be a array of strings')
            }
            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: async (value: string[] | [], { req }) => {
            if (value.length > 0 && value.some((item) => !ObjectId.isValid(item))) {
              throw new Error('Mentions must be a array of user_id')
            }
            if (value.length > 0) {
              const users = await Promise.all(
                value.map((item) => {
                  return databaseService.user.findOne({ _id: new ObjectId(item) })
                })
              )
              const nullIndex = users.findIndex((user) => user === null)
              if (nullIndex !== -1) throw new Error(`user_id ${value[nullIndex]} not found in the database`)
            }

            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value: Media[] | [], { req }) => {
            if (
              value.length > 0 &&
              value.some((item) => {
                return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
              })
            ) {
              throw new Error('Invalid medias')
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus(httpStatusCode.BAD_REQUEST, 'Invalid tweet_id')
            }
            const [tweet] = await databaseService.tweet
              .aggregate<Tweet>(getTweetDetailAggregate(new ObjectId(value as string)))
              .toArray()
            if (!tweet) throw new ErrorWithStatus(httpStatusCode.NOT_FOUND, 'Tweet not found')
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)

export const unbookmarkTweetValidator = validate(
  checkSchema(
    {
      bookmark_id: {
        custom: {
          options: async (value) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus(httpStatusCode.BAD_REQUEST, 'Invalid bookmark_id')
            }
            const bookmark = await databaseService.bookmark.findOne({ _id: new ObjectId(value as string) })
            if (!bookmark) throw new ErrorWithStatus(httpStatusCode.NOT_FOUND, 'Bookmark not found')
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const dislikeTweetValidator = validate(
  checkSchema(
    {
      like_id: {
        custom: {
          options: async (value) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus(httpStatusCode.BAD_REQUEST, 'Invalid like_id')
            }
            const like = await databaseService.like.findOne({ _id: new ObjectId(value as string) })
            if (!like) throw new ErrorWithStatus(httpStatusCode.NOT_FOUND, 'Like not found')
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.TweeterCircle) {
    // check user login or not
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus(httpStatusCode.UNAUTHORIZED, 'Unauthorized')
    }
    // check if author is banned or not verified
    const author = await databaseService.user.findOne({ _id: tweet.user_id })
    if (author?.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus(httpStatusCode.NOT_FOUND, 'The author of this tweet is banned')
    }

    // check if the user is not in twitter circle and if not is author
    const { user_id } = req.decoded_authorization
    const isInTwitterCircle = author?.twitter_circle.some((item) => item.equals(user_id))
    if (!isInTwitterCircle && !author?._id.equals(user_id)) {
      throw new ErrorWithStatus(httpStatusCode.FORBIDDEN, 'The tweet is not public')
    }
  }
  next()
})

export const paginationValidator = validate(
  checkSchema(
    {
      page: {
        notEmpty: {
          errorMessage: 'page is required'
        },
        isNumeric: true
      },
      limit: {
        notEmpty: {
          errorMessage: 'page is required'
        },
        isNumeric: true,
        custom: {
          options: (value) => {
            if (Number(value) > 100) throw new Error('Limit maximum 100')
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const tweetTypeValidator = validate(
  checkSchema(
    {
      tweet_type: {
        notEmpty: {
          errorMessage: 'tweet_type is required'
        },
        isNumeric: true,
        isIn: {
          options: [tweetTypeOptions],
          errorMessage: 'Invalid tweet type'
        }
      }
    },
    ['query']
  )
)

export const searchTweetValidator = validate(
  checkSchema(
    {
      media_type: {
        isIn: {
          options: [[...mediaTypes, undefined]],
          errorMessage: 'Invalid media type'
        }
      },
      content: {
        isString: {
          errorMessage: 'Content must be a string'
        }
      },
      people_followed: {
        isIn: {
          options: [[0, 1]],
          errorMessage: 'Invalid people_followed type'
        }
      }
    },
    ['query']
  )
)
