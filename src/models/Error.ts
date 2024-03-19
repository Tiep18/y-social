import httpStatusCode from '~/constants/httpStatus'

export type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  status: number
  message: string
  constructor(status: number, message: string) {
    this.status = status
    this.message = message
  }
}

export class EntityError extends ErrorWithStatus {
  error: ErrorType
  constructor(error: ErrorType, status?: number) {
    super(status || httpStatusCode.UNPROCESSABLE_ENTITY, 'Validation errors')
    this.error = error
  }
}
