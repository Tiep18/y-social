import { Collection, Db, MongoClient } from 'mongodb'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Like from '~/models/schemas/Like.schema'
import Conversation from '~/models/schemas/Conversation.schema'
import envConfig from '~/constants/envConfig'

const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@cluster0.pzfmz7x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class Database {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.dbName)
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      console.dir(err)
    }
  }

  get user(): Collection<User> {
    return this.db.collection('users')
  }
  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection('refresh_tokens')
  }
  get follower(): Collection<Follower> {
    return this.db.collection('follower')
  }
  get tweet(): Collection<Tweet> {
    return this.db.collection('tweets')
  }
  get hashtag(): Collection<Hashtag> {
    return this.db.collection('hashtags')
  }
  get bookmark(): Collection<Bookmark> {
    return this.db.collection('bookmarks')
  }
  get like(): Collection<Like> {
    return this.db.collection('likes')
  }
  get conversation(): Collection<Conversation> {
    return this.db.collection('conversations')
  }
}

const databaseService = new Database()
export default databaseService
