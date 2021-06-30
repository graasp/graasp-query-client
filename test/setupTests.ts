// redefine global type to mock fetch
declare global {
  namespace NodeJS {
    interface Global {
      fetch: any;
    }
  }
}

// mock global fetch
global.fetch = require('node-fetch');

// transform this file into a module
export {};
