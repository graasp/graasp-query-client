/**
 * Mock WebSocket class for Graasp WS protocol
 */

export default class MockWebSocket {
  CLOSED: number;

  OPEN: number;

  readyState: number;

  onopen?: () => void;

  onmessage?: (msg: unknown) => void;

  constructor() {
    this.CLOSED = 0;
    this.OPEN = 1;

    this.readyState = this.OPEN;

    this.send = this.send.bind(this);
    this.receive = this.receive.bind(this);
    this.addEventListener = this.addEventListener.bind(this);
  }

  send(msg: string) {
    const req = JSON.parse(msg);
    // acknowledge request
    if (req.action?.includes('subscribe')) {
      const res = {
        data: JSON.stringify({
          realm: 'notif',
          type: 'response',
          status: 'success',
          request: req,
        }),
      };
      this.onmessage?.(res);
    }
  }

  receive(msg: object) {
    const event = {
      data: JSON.stringify(msg),
    };
    this.onmessage?.(event);
  }

  addEventListener(
    event: 'message' | 'open',
    handler: (message?: unknown) => void,
  ) {
    this[`on${event}`] = handler;
    if (event === 'open') {
      handler();
    }
  }
}
