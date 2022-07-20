import { StatusCodes } from "http-status-codes"
import { retry } from "../queryClient"

const INITIAL_FAILURE_COUNT = 0

// use graasp utils
const buildError = ({ statusCode, data }: { statusCode: number, data?: unknown }) => {
  class MyError extends Error {
    response: {
      status: number;
      statusCode: number;
      data?: unknown
    };

    constructor() {
      super()
      this.response = {
        status: statusCode,
        statusCode,
        data
      }
    }
  }
  return new MyError()
}

describe('Axios Tests', () => {
  describe('retry', () => {
    it('Return false for some code statuses', () => {

      const error: Error = buildError({ statusCode: StatusCodes.UNAUTHORIZED })
      expect(retry(INITIAL_FAILURE_COUNT, error)).toBeFalsy()
      const error1: Error = buildError({ statusCode: StatusCodes.NOT_FOUND })
      expect(retry(INITIAL_FAILURE_COUNT, error1)).toBeFalsy()
      const error2: Error = buildError({ statusCode: StatusCodes.BAD_REQUEST })
      expect(retry(INITIAL_FAILURE_COUNT, error2)).toBeFalsy()
      const error3: Error = buildError({ statusCode: StatusCodes.FORBIDDEN })
      expect(retry(INITIAL_FAILURE_COUNT, error3)).toBeFalsy()
      const error4: Error = buildError({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR })
      expect(retry(INITIAL_FAILURE_COUNT, error4)).toBeFalsy()

    })
    it('Return failure count test for other code statuses', () => {

      const error: Error = buildError({ statusCode: StatusCodes.BAD_GATEWAY })
      expect(retry(INITIAL_FAILURE_COUNT, error)).toBeTruthy()
      const error1: Error = buildError({ statusCode: StatusCodes.GATEWAY_TIMEOUT })
      expect(retry(INITIAL_FAILURE_COUNT, error1)).toBeTruthy()

    })
    it('Return false for errors in array', () => {

      const error: Error = buildError({ statusCode: StatusCodes.OK, data: { statusCode: StatusCodes.BAD_REQUEST } })
      expect(retry(INITIAL_FAILURE_COUNT, error)).toBeFalsy()

    })
  })
})
