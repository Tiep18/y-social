import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import { UPLOAD_IMAGE_TEM_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEM_DIR } from '~/constants/config'

export const initUploadFolders = () => {
  ;[UPLOAD_VIDEO_TEM_DIR, UPLOAD_IMAGE_TEM_DIR].forEach((folder) => {
    const uploadFolder = fs.existsSync(folder)
    if (!uploadFolder) {
      fs.mkdirSync(folder, {
        recursive: true
      })
    }
  })
}

let cancelUploads = false
export const handleUploadImages = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_IMAGE_TEM_DIR),
    keepExtensions: true,
    maxFiles: 4,
    maxFileSize: 400 * 1024 * 4, // 400kb * 4
    filter: function ({ name, originalFilename, mimetype }) {
      //check key name
      if (name !== 'images') {
        form.emit('error' as any, new Error('Key name must be "images"') as any)
        return false
      }
      // keep only images
      const valid = mimetype && mimetype.includes('image')
      if (!valid) {
        form.emit('error' as any, new Error('Invalid image') as any) // optional make form.parse error
        cancelUploads = true //variable to make filter return false after the first problem
      }
      return Boolean(valid) && !cancelUploads
    }
  })

  const result = await new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // Check if exists key name "image" but image is empty
      if (!files.images) {
        return reject(new Error('File is empty'))
      }
      resolve(files.images)
    })
  })
  return result
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_VIDEO_DIR),
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 1024 * 1024 * 60, // 4mb
    filter: function ({ name, originalFilename, mimetype }) {
      //check key name
      if (name !== 'video') {
        form.emit('error' as any, new Error('Key name must be "video"') as any)
        return false
      }
      // keep only video
      const valid = mimetype && mimetype.includes('video')
      if (!valid) {
        form.emit('error' as any, new Error('Invalid video') as any)
      }
      return Boolean(valid)
    }
  })

  const result = await new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      // Check if exists key name "video" but video is empty
      if (!files.video) {
        return reject(new Error('File is empty'))
      }

      resolve(files.video[0])
    })
  })
  return result
}
export const getName = (fullName: string) => {
  const arrayName = fullName.split('.')
  arrayName.pop()
  return arrayName.join('.')
}
