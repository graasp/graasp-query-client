/**
 * Graasp websocket client top-level file
 * Entry point to use the Graasp WebSocket client in front-end applications
 */
export * from './hooks';
export { configureWebsocketClient } from './ws-client';
export { default as MockWebSocket } from './mock-ws-client';
