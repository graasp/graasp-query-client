import { describe, expect, it } from 'vitest';

import { UndefinedArgument, UserIsSignedOut } from './errors.js';

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
