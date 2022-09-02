// eslint-disable-next-line max-classes-per-file
import { StatusCodes } from 'http-status-codes';

export class UserIsSignedOut extends Error {
  code: number;

  constructor() {
    super('User is not authenticated');
    this.code = StatusCodes.UNAUTHORIZED;
  }
}

export class UndefinedArgument extends Error {
  constructor() {
    super();
    this.message = 'UnexpectedInput';
    this.name = 'UnexpectedInput';
    this.stack = new Error().stack;
  }
}
