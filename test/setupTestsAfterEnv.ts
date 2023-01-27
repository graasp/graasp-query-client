import * as matchers from 'jest-immutable-matchers';

global.beforeEach(() => {
  expect.extend(matchers);
});
