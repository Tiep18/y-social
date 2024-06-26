import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR } from '~/constants/config'
import { getName, handleUploadImages, handleUploadVideo } from '~/utils/file'
import { MediaType } from '~/constants/enum'
import envConfig from '~/constants/envConfig'

class MediaService {
  async uploadImages(req: Request) {
    const files = await handleUploadImages(req)
    return await Promise.all(
      files.map(async (file) => {
        const newFileName = getName(file.newFilename)

        // allow delete file input after convert
        sharp.cache(false)

        await sharp(file.filepath)
          .jpeg()
          .toFile(path.resolve(UPLOAD_IMAGE_DIR, `${newFileName}.jpg`))

        //Clear temporary file
        fs.unlinkSync(file.filepath)

        return {
          type: MediaType.IMAGE,
          url: `http://localhost:${envConfig.port}/static/image/${newFileName}.jpg`
        }
      })
    )
  }

  async uploadVideos(req: Request) {
    const file = await handleUploadVideo(req)
    return {
      type: MediaType.VIDEO,
      url: `http://localhost:${envConfig.port}/static/video-streaming/${file.newFilename}`
    }
  }
}

const mediaService = new MediaService()
export default mediaService
