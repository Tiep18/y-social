import express from 'express'
import usersRoute from './routes/users.routes'
import databaseService from './services/db.service'
import { defaultErrorHandler } from './utils/handler'
import oauthRoute from './routes/oauth.routes'
import mediaRoute from './routes/media.routes'
import { initUploadFolders } from './utils/file'
import staticRoute from './routes/static.routes'
import cors from 'cors'

const port = process.env.PORT || 4000

const app = express()

initUploadFolders()

app.use(cors())
// chuyen req.body sang json
app.use(express.json())

app.use('/api/users', usersRoute)
app.use('/api', oauthRoute)
app.use('/api/medias', mediaRoute)
app.use('/static', staticRoute)
app.use('/static', express.static('uploads'))

// connect to database
databaseService.connect()

// Error handling
app.use(defaultErrorHandler)

app.listen(port, () => console.log('listening on port', port))
