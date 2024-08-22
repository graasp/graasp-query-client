import { StatusCodes } from 'http-status-codes';

export class UserIsSignedOut extends Error {
  code: number;

  constructor() {
    super('User is not authenticated');
    this.code = StatusCodes.UNAUTHORIZED;
  }
}

export class UndefinedArgument extends Error {
  constructor(data?: object) {
    super();
    this.message = `UnexpectedInput ${JSON.stringify(data ?? {})}`;
    this.name = 'UnexpectedInput';
    this.stack = new Error().stack;
  }
}
