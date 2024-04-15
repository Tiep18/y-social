import { ObjectId } from 'mongodb'
import { TweetType } from '~/constants/enum'

export const getTweetDetailAggregate = (tweet_id: ObjectId) => {
  return [
    {
      $match: {
        _id: tweet_id
      }
    },
    {
      $lookup: {
        from: 'hashtags',
        localField: 'hashtags',
        foreignField: '_id',
        as: 'hashtags'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'mentions',
        foreignField: '_id',
        as: 'mentions'
      }
    },
    {
      $addFields: {
        mentions: {
          $map: {
            input: '$mentions',
            as: 'mention',
            in: {
              _id: '$$mention._id',
              name: '$$mention.name',
              email: '$$mention.email'
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'bookmarks',
        localField: '_id',
        foreignField: 'tweet_id',
        as: 'bookmarks'
      }
    },
    {
      $lookup: {
        from: 'tweets',
        localField: '_id',
        foreignField: 'parent_id',
        as: 'tweet_children'
      }
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'tweet_id',
        as: 'likes'
      }
    },
    {
      $addFields: {
        bookmarks: {
          $size: '$bookmarks'
        },
        likes: {
          $size: '$likes'
        },
        retweet_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.Retweet]
              }
            }
          }
        },
        comment_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.Comment]
              }
            }
          }
        },
        quote_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.QuoteTweet]
              }
            }
          }
        }
      }
    },
    {
      $project: {
        tweet_children: 0
      }
    }
  ]
}

export const getTweetChildrenAggregate = ({
  limit,
  page,
  parent_id,
  tweet_type
}: {
  parent_id: ObjectId
  tweet_type: TweetType
  limit: number
  page: number
}) => {
  return [
    {
      $match: {
        parent_id: parent_id,
        type: tweet_type
      }
    },
    {
      $skip: limit * (page - 1)
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'hashtags',
        localField: 'hashtags',
        foreignField: '_id',
        as: 'hashtags'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'mentions',
        foreignField: '_id',
        as: 'mentions'
      }
    },
    {
      $addFields: {
        mentions: {
          $map: {
            input: '$mentions',
            as: 'mention',
            in: {
              _id: '$$mention._id',
              name: '$$mention.name',
              email: '$$mention.email'
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'bookmarks',
        localField: '_id',
        foreignField: 'tweet_id',
        as: 'bookmarks'
      }
    },
    {
      $lookup: {
        from: 'tweets',
        localField: '_id',
        foreignField: 'parent_id',
        as: 'tweet_children'
      }
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'tweet_id',
        as: 'likes'
      }
    },
    {
      $addFields: {
        bookmarks: {
          $size: '$bookmarks'
        },
        likes: {
          $size: '$likes'
        },
        retweet_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.Retweet]
              }
            }
          }
        },
        comment_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.Comment]
              }
            }
          }
        },
        quote_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.QuoteTweet]
              }
            }
          }
        }
      }
    },
    {
      $project: {
        tweet_children: 0
      }
    }
  ]
}

export const getNewsFeedAggregate = ({
  limit,
  page,
  ids,
  user_id
}: {
  limit: number
  page: number
  ids: ObjectId[]
  user_id: ObjectId
}) => {
  return [
    {
      $match: {
        user_id: {
          $in: ids
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $match: {
        $or: [
          {
            audience: 0
          },
          {
            $and: [
              {
                audience: 1
              },
              {
                $or: [
                  {
                    'user.twitter_circle': {
                      $in: [user_id]
                    }
                  },
                  {
                    user_id: user_id
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    {
      $skip: limit * (page - 1)
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'hashtags',
        localField: 'hashtags',
        foreignField: '_id',
        as: 'hashtags'
      }
    },
    {
      $project: {
        user: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          twitter_circle: 0
        }
      }
    },
    {
      $unwind: {
        path: '$user'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'mentions',
        foreignField: '_id',
        as: 'mentions'
      }
    },
    {
      $addFields: {
        mentions: {
          $map: {
            input: '$mentions',
            as: 'mention',
            in: {
              _id: '$$mention._id',
              name: '$$mention.name',
              email: '$$mention.email'
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'bookmarks',
        localField: '_id',
        foreignField: 'tweet_id',
        as: 'bookmarks'
      }
    },
    {
      $lookup: {
        from: 'tweets',
        localField: '_id',
        foreignField: 'parent_id',
        as: 'tweet_children'
      }
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'tweet_id',
        as: 'likes'
      }
    },
    {
      $addFields: {
        bookmarks: {
          $size: '$bookmarks'
        },
        likes: {
          $size: '$likes'
        },
        retweet_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.Retweet]
              }
            }
          }
        },
        comment_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.Comment]
              }
            }
          }
        },
        quote_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.QuoteTweet]
              }
            }
          }
        }
      }
    },
    {
      $project: {
        tweet_children: 0
      }
    }
  ]
}

export const getTotalNewsFeedAggregate = ({ ids, user_id }: { ids: ObjectId[]; user_id: ObjectId }) => {
  return [
    {
      $match: {
        user_id: {
          $in: ids
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $match: {
        $or: [
          {
            audience: 0
          },
          {
            $and: [
              {
                audience: 1
              },
              {
                $or: [
                  {
                    'user.twitter_circle': {
                      $in: [user_id]
                    }
                  },
                  {
                    user_id: user_id
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  ]
}

export const searchTweetAggregate = ({
  content,
  limit,
  page,
  people_followed,
  ids,
  user_id,
  media_type
}: {
  limit: number
  page: number
  media_type?: number
  people_followed?: number
  content: string
  ids?: ObjectId[]
  user_id: ObjectId
}) => {
  const $match: any = {
    $text: {
      $search: content
    }
  }
  if (media_type === 1 || media_type === 0) {
    $match['medias.type'] = media_type
  }
  if (people_followed === 1 && ids) {
    $match.user_id = {
      $in: ids
    }
  }
  return [
    {
      $match
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $match: {
        $or: [
          {
            audience: 0
          },
          {
            $and: [
              {
                audience: 1
              },
              {
                $or: [
                  {
                    'user.twitter_circle': {
                      $in: [user_id]
                    }
                  },
                  {
                    user_id
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    {
      $skip: limit * (page - 1)
    },
    {
      $limit: limit
    },
    {
      $project: {
        user: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          twitter_circle: 0
        }
      }
    },
    {
      $unwind: {
        path: '$user'
      }
    },
    {
      $lookup: {
        from: 'hashtags',
        localField: 'hashtags',
        foreignField: '_id',
        as: 'hashtags'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'mentions',
        foreignField: '_id',
        as: 'mentions'
      }
    },
    {
      $addFields: {
        mentions: {
          $map: {
            input: '$mentions',
            as: 'mention',
            in: {
              _id: '$$mention._id',
              name: '$$mention.name',
              email: '$$mention.email'
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'bookmarks',
        localField: '_id',
        foreignField: 'tweet_id',
        as: 'bookmarks'
      }
    },
    {
      $lookup: {
        from: 'tweets',
        localField: '_id',
        foreignField: 'parent_id',
        as: 'tweet_children'
      }
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'tweet_id',
        as: 'likes'
      }
    },
    {
      $addFields: {
        bookmarks: {
          $size: '$bookmarks'
        },
        likes: {
          $size: '$likes'
        },
        retweet_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.Retweet]
              }
            }
          }
        },
        comment_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.Comment]
              }
            }
          }
        },
        quote_count: {
          $size: {
            $filter: {
              input: '$tweet_children',
              as: 'item',
              cond: {
                $eq: ['$$item.type', TweetType.QuoteTweet]
              }
            }
          }
        }
      }
    },
    {
      $project: {
        tweet_children: 0
      }
    }
  ]
}
