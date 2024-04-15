import { faker } from '@faker-js/faker'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/db.service'
import { UserRegister } from '~/types/user.type'
import hashPassword from './crypto'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import { ObjectId } from 'mongodb'
import { CreateTweetReqBody } from '~/types/tweet.type'
import tweetService from '~/services/tweet.service'
import userService from '~/services/users.service'

const USER_NUMBER = 100
const MY_ID = new ObjectId('660fb7f05e5a6771368d108e')

export function createRandomUser(): UserRegister {
  return {
    email: faker.internet.email(),
    name: faker.internet.userName(),
    password: 'D23dasd!',
    confirm_password: 'D23dasd!',
    date_of_birth: faker.date.birthdate().toISOString()
  }
}

export const users = faker.helpers.multiple(createRandomUser, {
  count: USER_NUMBER
})

async function insertUserToDB() {
  console.log('Inserting user...')
  const usersInDb = await Promise.all(
    users.map(async (user) => {
      return await databaseService.user.insertOne(
        new User({
          ...user,
          password: hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.Verified
        })
      )
    })
  )
  console.log('Insert user successfully')

  return usersInDb.map((item) => item.insertedId)
}

async function followUsers(ids: ObjectId[]) {
  console.log('following user')

  await Promise.all(
    ids.map((id) =>
      userService.follow({
        user_id: MY_ID,
        followed_user_id: id
      })
    )
  )
  console.log('followed user successfull')
}

export function createRandomTweet(): CreateTweetReqBody {
  return {
    type: TweetType.Tweet,
    audience: TweetAudience.EVERYONE,
    content: faker.lorem.paragraph({
      min: 10,
      max: 100
    }),
    parent_id: null,
    hashtags: [],
    mentions: [],
    medias: [{ url: faker.image.avatar(), type: MediaType.VIDEO }]
  }
}

async function createTweetToDB(user_ids: ObjectId[]) {
  console.log('Creating tweet to database')

  await Promise.all(
    user_ids.map((id) => {
      const tweets = faker.helpers.multiple(createRandomTweet, {
        count: 2
      })
      return Promise.all(tweets.map((tweet) => tweetService.createTweet(id, tweet)))
    })
  )
  console.log('Created tweet successfull')
}

insertUserToDB().then((ids) => {
  followUsers(ids)
  createTweetToDB(ids)
})
