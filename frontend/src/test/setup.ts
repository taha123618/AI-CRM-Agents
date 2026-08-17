import { GlobalWindow } from 'happy-dom';

// 1. Initialize DOM environment if not running in a browser / jsdom environment (e.g. bun test)
if (typeof globalThis.document === 'undefined') {
  const domWindow = new GlobalWindow({ url: 'http://localhost:3000' });
  const descriptors = Object.getOwnPropertyDescriptors(domWindow);
  for (const [key, desc] of Object.entries(descriptors)) {
    if (!(key in globalThis)) {
      try {
        Object.defineProperty(globalThis, key, desc);
      } catch {
        // ignore un-configurable properties
      }
    }
  }
  (globalThis as any).window = domWindow;
  (globalThis as any).document = domWindow.document;
  (globalThis as any).navigator = domWindow.navigator;
  (globalThis as any).HTMLElement = domWindow.HTMLElement;
  (globalThis as any).Element = domWindow.Element;
  (globalThis as any).Node = domWindow.Node;
  (globalThis as any).Event = domWindow.Event;
  (globalThis as any).CustomEvent = domWindow.CustomEvent;
}

// 2. Import jest-dom matchers
import '@testing-library/jest-dom';

// 3. Mock matchMedia for responsive UI components
if (typeof globalThis.window !== 'undefined') {
  try {
    Object.defineProperty(globalThis.window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  } catch {
    // ignore
  }
}

// 4. Mock ResizeObserver for Recharts and layout containers
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
