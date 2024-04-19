import express from 'express'
import { createServer } from 'http'
import usersRoute from './routes/users.routes'
import databaseService from './services/db.service'
import { defaultErrorHandler } from './utils/handler'
import oauthRoute from './routes/oauth.routes'
import mediaRoute from './routes/media.routes'
import { initUploadFolders } from './utils/file'
import staticRoute from './routes/static.routes'
import cors from 'cors'
import tweetsRoute from './routes/tweet.routes'
import bookmarkRoute from './routes/bookmark.routes'
import likeRoute from './routes/like.routes'
import searchRoute from './routes/search.routes'
import conversationRoute from './routes/conversation.routes'
import initSocket from './utils/socket'
import envConfig from './constants/envConfig'

// import './utils/fakeData'

const port = envConfig.port

const app = express()
const httpServer = createServer(app)
initUploadFolders()

app.use(cors())
// convert req.body to json
app.use(express.json())

app.use('/api/users', usersRoute)
app.use('/api', oauthRoute)
app.use('/api/medias', mediaRoute)
app.use('/api/tweets', tweetsRoute)
app.use('/api/bookmarks', bookmarkRoute)
app.use('/api/likes', likeRoute)
app.use('/api/search', searchRoute)
app.use('/api/conversations', conversationRoute)
app.use('/static', staticRoute)
app.use('/static', express.static('uploads'))

// connect to database
databaseService.connect()

// socket
initSocket(httpServer)

// Error handling
app.use(defaultErrorHandler)

httpServer.listen(port, () => console.log('listening on port', port))
