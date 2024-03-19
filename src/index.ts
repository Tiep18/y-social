import express, { Request, Response, NextFunction, RequestHandler } from 'express'
import usersRoute from './routes/users.routes'
import databaseService from './services/db.service'
import { defaultErrorHandler } from './utils/handler'

const port = 3000
const app = express()

// chuyen req.body sang json
app.use(express.json())

app.use('/api/users', usersRoute)

// connect to database
databaseService.connect()

// Error handling
app.use(defaultErrorHandler)

app.listen(port, () => console.log('listening on port', port))
