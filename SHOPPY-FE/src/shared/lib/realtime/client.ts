import { Client, type IFrame, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { realtimeConfig } from '../../config/realtime';

export interface RealtimeClientOptions {
  url?: string;
  token?: string;
  debug?: boolean;
  reconnectDelayMs?: number;
}

export const createRealtimeClient = (options: RealtimeClientOptions = {}) => {
  const url = options.url ?? realtimeConfig.websocketUrl;
  const token = options.token;

  const client = new Client({
    brokerURL: undefined,
    reconnectDelay: options.reconnectDelayMs ?? 5000,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    webSocketFactory: () => new SockJS(url),
    debug: options.debug ? (message) => console.log(message) : () => {},
  });

  return client;
};

export const connectRealtimeClient = (client: Client) =>
  new Promise<IFrame>((resolve, reject) => {
    client.onConnect = (frame) => resolve(frame);
    client.onStompError = (frame) => reject(frame);
    client.onWebSocketError = (event) => reject(event);
    client.activate();
  });

export const disconnectRealtimeClient = async (client: Client) => {
  if (client.active) {
    await client.deactivate();
  }
};

export const subscribeTopic = (
  client: Client,
  destination: string,
  callback: (message: string) => void,
): StompSubscription =>
  client.subscribe(destination, (message) => callback(message.body));

export const publishMessage = (
  client: Client,
  destination: string,
  body: unknown,
) => {
  client.publish({
    destination,
    body: JSON.stringify(body),
  });
};
