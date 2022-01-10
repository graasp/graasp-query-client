// redefine global type to mock fetch
import { WebSocket } from 'mock-socket';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetch: any;
      // eslint-disable-next-line @typescript-eslint/ban-types
      WebSocket: Function;
    }
  }
}

global.WebSocket = WebSocket;

// transform this file into a module
export {};
