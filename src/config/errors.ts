import { StatusCodes } from 'http-status-codes';

// eslint-disable-next-line import/prefer-default-export
export const MEMBER_NOT_FOUND_ERROR = 'MEMBER_NOT_FOUND_ERROR';

export class UserIsSignedOut extends Error {
  code: number;

  constructor() {
    super('User is not authenticated');
    this.code = StatusCodes.UNAUTHORIZED;
  }
}
