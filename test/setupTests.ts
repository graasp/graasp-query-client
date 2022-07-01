// redefine global type to mock fetch
import { WebSocket } from 'mock-socket';
import axios from 'axios';

// adapter for test
axios.defaults.adapter = require('axios/lib/adapters/http');

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetch: any;
      // eslint-disable-next-line @typescript-eslint/ban-types
      WebSocket: Function;
      document: Document;
      window: Window;
      navigator: Navigator;
    }
  }
}

Object.defineProperty(window, 'location', {
  value: {
    hash: {
      endsWith: jest.fn(),
      includes: jest.fn(),
    },
    assign: jest.fn(),
  },
  writable: true,
});

global.document = window.document;
global.window = global.document.defaultView as Window & typeof globalThis;

global.WebSocket = WebSocket;
