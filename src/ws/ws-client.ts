/**
 * Graasp websocket client
 * Provides front-end integration for real-time updates using WebSocket
 * Implements the client protocol from https://github.com/graasp/graasp-websockets
 * 
 * @author Alexandre CHAU
 */

import { ClientMessage, ServerMessage } from "graasp-websockets/src/interfaces/message";
import { QueryClientConfig } from "../types";

type Channel = {
    entity: "item" | "member";
    name: string,
};
type UpdateHandlerFn = (data: ServerMessage) => void;

/**
 * Helper to remove the first element in an array that
 * matches the provided value IN PLACE
 */
function arrayRemoveFirst<T>(array: Array<T>, value: T, eqFn = (a: T, b: T) => a === b) {
    const pos = array.findIndex(v => eqFn(v, value));
    array.splice(pos, 1);
}

export const configureWebsocketClient = (config: QueryClientConfig) => {
    // native client WebSocket instance
    const ws = new WebSocket(config.WS_HOST);

    // (de-)serializer instance
    const serdes = {
        serialize: (msg: ClientMessage): string => JSON.stringify(msg),
        parse: (data: string): ServerMessage => JSON.parse(data),
    };

    const send = (request: ClientMessage) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(serdes.serialize(request));
        }
    };

    const sendSubscribeRequest = (channel: Channel) => {
        send({
            realm: "notif",
            action: "subscribe",
            entity: channel.entity,
            channel: channel.name,
        });
    };

    const sendUnsubscribeRequest = (channel: Channel) => {
        send({
            realm: "notif",
            action: "unsubscribe",
            channel: channel.name,
        });
    };

    const subscriptions = {
        early: new Map<Channel, Array<UpdateHandlerFn>>(),
        waitingAck: new Map<Channel, Array<UpdateHandlerFn>>(),
        current: new Map<Channel, Array<UpdateHandlerFn>>(),
        info: new Array<UpdateHandlerFn>(),

        add: (channel: Channel | "info", handler: UpdateHandlerFn) => {
            if (channel === "info") {
                // if subscribed to info, no ack to wait for
                subscriptions.info.push(handler);
            } else {
                // if WS not ready, add to early, otherwise add to waiting ack
                const map = (ws.readyState === ws.OPEN) ? subscriptions.waitingAck : subscriptions.early;
                // create queue if doesn't exist for this channel, otherwise push to it
                const queue = map.get(channel);
                if (queue === undefined) {
                    map.set(channel, [handler]);
                } else {
                    queue.push(handler);
                }
            }
        },

        remove: (channel: Channel | "info", handler: UpdateHandlerFn) => {
            if (channel === "info") {
                arrayRemoveFirst(subscriptions.info, handler);
            } else {
                // helper to remove from a subscription map
                const _remove = (map: Map<Channel, Array<UpdateHandlerFn>>, channel: Channel, handler: UpdateHandlerFn) => {
                    const queue = map.get(channel);
                    if (queue !== undefined) {
                        arrayRemoveFirst(queue, handler);
                    }
                };

                // remove from all maps
                _remove(subscriptions.early, channel, handler);
                _remove(subscriptions.waitingAck, channel, handler);
                _remove(subscriptions.current, channel, handler);
            }
        },

        ackOne: (channel: Channel) => {
            // move first handler from waitingAck to current
            const handler = subscriptions.waitingAck.get(channel)?.shift();
            if (handler) {
                const current = subscriptions.current.get(channel);
                if (channel === undefined) {
                    subscriptions.current.set(channel, [handler]);
                } else {
                    current?.push(handler);
                }
             }
        },
    };

    ws.addEventListener('open', () => {
        console.debug('Websocket connection opened');

        // send all early subscriptions
        subscriptions.early.forEach((queue, channel) => {
            queue.forEach(handler => {
                // move handler to waitingAck (guaranteed now since ws.readyState === OPEN)
                subscriptions.add(channel, handler);
                sendSubscribeRequest(channel);
            });
        });
        subscriptions.early.clear();
    });

    ws.addEventListener('message', event => {
        const update = serdes.parse(event.data);

        switch (update.type) {
            case "info": {
                subscriptions.info.forEach(fn => fn(update));
                break;
            };

            case "response": {
                if (update.status === "success") {
                    const req = update.request;
                    if (req?.action === "subscribe") {
                        subscriptions.ackOne({ name: req?.channel, entity: req?.entity });
                    }
                }
                else {
                    console.debug(`WS error response: ${update.error?.name} ${update.error?.message}`);
                }
                break;
            };

            case "update": {
                const handlers = subscriptions.current.get({ name: update.channel, entity: update.body.entity });
                handlers?.forEach(fn => fn(update));
                break;
            };

            default:
                console.debug('Unknown WS message');
        };
    });

    return {
        subscribe: (channel: Channel | "info", handler: UpdateHandlerFn) => {
            subscriptions.add(channel, handler);
            if (channel !== "info") { sendSubscribeRequest(channel); };
        },
        unsubscribe: (channel: Channel | "info", handler: UpdateHandlerFn) => {
            subscriptions.remove(channel, handler);
            if (channel !== "info") { sendUnsubscribeRequest(channel); };
        },
    };
};