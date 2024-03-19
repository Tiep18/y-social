import { Request, Response, NextFunction, RequestHandler } from 'express'
import { omit } from 'lodash'
import httpStatusCode from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'

export const wrapRequestHandler = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, 'status'))
  }

  return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ message: err.message })
}
