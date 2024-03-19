import express from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import httpStatusCode from '~/constants/httpStatus'
import { EntityError, ErrorType, ErrorWithStatus } from '~/models/Error'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    const entityError = new EntityError({})
    const errorObject = errors.mapped()

    for (const key in errorObject) {
      const { msg } = errorObject[key]

      if (msg instanceof ErrorWithStatus && msg.status !== httpStatusCode.UNPROCESSABLE_ENTITY) {
        next(msg)
      }
      entityError.error[key] = errorObject[key]
    }

    next(entityError)
  }
}

export default validate
