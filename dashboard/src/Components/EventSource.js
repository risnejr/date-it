// @flow
declare class EventSource extends EventTarget {
  +url: string;
  +withCredentials: boolean;
  +CONNECTING: number;
  +OPEN: number;
  +CLOSED: number;
  +readyState: number;
  onopen: (evt: MessageEvent) => any;
  onmessage: (evt: MessageEvent) => any;
  onerror: (evt: MessageEvent) => any;
  close(): void;

  constructor(url: string, eventSourceInitDict?: EventSourceInit): EventSource;
}

declare interface EventSourceInit {
  +withCredentials: boolean;
}

export default EventSource;
