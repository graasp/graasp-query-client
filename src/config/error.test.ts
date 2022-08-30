import { UndefinedArgument, UserIsSignedOut } from './errors';

describe('Errors', () => {
  it('Undefined Argument error', () => {
    const error = new UndefinedArgument();
    expect(error).toBeTruthy();
  });

  it('User Is Signed Out ', () => {
    const error = new UserIsSignedOut();
    expect(error).toBeTruthy();
  });
});
