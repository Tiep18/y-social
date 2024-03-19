import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schemas'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import Follower from '~/models/schemas/Follower.schemas'

config()

const { DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env
const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.pzfmz7x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class Database {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(DB_NAME)
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
}

const databaseService = new Database()
export default databaseService
