declare module '@ionic/pwa-elements/dist/esm/loader.js' {
  export interface CustomElementsDefineOptions {
    exclude?: string[];
    resourcesUrl?: string;
    syncQueue?: boolean;
    jmp?: (c: Function) => unknown;
    raf?: (c: FrameRequestCallback) => number;
    ael?: (
      el: EventTarget,
      eventName: string,
      listener: EventListenerOrEventListenerObject,
      options: boolean | AddEventListenerOptions
    ) => void;
    rel?: (
      el: EventTarget,
      eventName: string,
      listener: EventListenerOrEventListenerObject,
      options: boolean | AddEventListenerOptions
    ) => void;
  }

  export function defineCustomElements(
    win?: Window,
    opts?: CustomElementsDefineOptions
  ): Promise<void>;
}
