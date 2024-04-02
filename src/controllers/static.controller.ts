import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/config'
import httpStatusCode from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'

export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any)?.status || 500).send('Not Found')
    }
  })
}

export const serveVideoStreamingController = async (req: Request, res: Response) => {
  //get range from request headers
  const range = req.headers.range

  if (!range) throw new ErrorWithStatus(httpStatusCode.BAD_REQUEST, 'Range not specified')

  const { name } = req.params

  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

  // calculate video size (bytes)
  const videoSize = fs.statSync(videoPath).size

  // size per video segment
  const chunkSize = 10 ** 6

  // calculate start of range
  const start = Number(range.replace(/\D/g, ''))

  // get the end of range
  const end = Math.min(start + chunkSize, videoSize - 1)

  // calculate real size of video segment
  const contentLength = end - start + 1

  //import mime library to get content type
  // const mime = (await import('mime')).default

  // const contentType = mime.getType(videoPath) || 'video/*'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Type': 'video/mp4',
    'Content-Length': contentLength
  }

  res.writeHead(httpStatusCode.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
