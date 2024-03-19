import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

type KeyOfPick<T> = Array<keyof T>

export const filterResquestBody =
  <T>(keyOfPick: KeyOfPick<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const body = pick(req.body, keyOfPick)
    req.body = body
    next()
  }
