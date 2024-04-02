import { Router } from 'express'
import { uploadImagesController, uploadVideosController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'
const mediaRoute = Router()

/**
 * Description: Upload images
 * Path: /upload/images
 * Method: POST
 * Body: {images: images file}
 * Header: {'Content-Type': '}
 */
mediaRoute.post('/upload/images', accessTokenValidator, verifyUserValidator, wrapRequestHandler(uploadImagesController))

/**
 * Description: Upload video
 * Path: /upload/video
 * Method: POST
 * Body: {images: video file}
 * Header: {'Content-Type': '}
 */
mediaRoute.post('/upload/videos', accessTokenValidator, verifyUserValidator, wrapRequestHandler(uploadVideosController))

export default mediaRoute
