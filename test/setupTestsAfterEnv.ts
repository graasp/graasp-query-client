import * as matchers from 'jest-immutable-matchers';

global.beforeEach(function () {
  expect.extend(matchers);
});
