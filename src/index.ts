import express from 'express'
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
// import './utils/fakeData'

const port = process.env.PORT || 4000

const app = express()

initUploadFolders()

app.use(cors())
// chuyen req.body sang json
app.use(express.json())

app.use('/api/users', usersRoute)
app.use('/api', oauthRoute)
app.use('/api/medias', mediaRoute)
app.use('/api/tweets', tweetsRoute)
app.use('/api/bookmarks', bookmarkRoute)
app.use('/api/likes', likeRoute)
app.use('/api/search', searchRoute)
app.use('/static', staticRoute)
app.use('/static', express.static('uploads'))

// connect to database
databaseService.connect()

// Error handling
app.use(defaultErrorHandler)

app.listen(port, () => console.log('listening on port', port))
