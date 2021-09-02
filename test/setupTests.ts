// redefine global type to mock fetch
declare global {
  namespace NodeJS {
    interface Global {
      fetch: any;
      WebSocket: Function;
    }
  }
}

// mock global fetch
global.fetch = require('node-fetch');
global.WebSocket = () => ({
  addEventListener: () => {},
});

// transform this file into a module
export {};
