import { Request, Response } from 'express'
import mediaService from '~/services/medias.service'

export const uploadImagesController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadImages(req)
  return res.json({ result })
}

export const uploadVideosController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadVideos(req)
  return res.json({ result })
}
