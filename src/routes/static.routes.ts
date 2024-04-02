import { Router } from 'express'
import { serveImageController, serveVideoStreamingController } from '~/controllers/static.controller'
import { wrapRequestHandler } from '~/utils/handler'
const staticRoute = Router()

/**
 * Description: serve image file
 * Path: /image/:name
 * Method: GET
 */
staticRoute.get('/image/:name', wrapRequestHandler(serveImageController))

/**
 * Description: streaming video
 * Path: /video-streaming/:name
 * Method: GET
 */
staticRoute.get('/video-streaming/:name', wrapRequestHandler(serveVideoStreamingController))

export default staticRoute
