export type EventListener<T> = (event: T) => void;

export class EventDispatcher<T> {
  private static eventName = '__event';
  private target = document.createTextNode('');
  private listeners: Map<EventListener<T>, (e: Event) => void> = new Map();

  addListener(listener: EventListener<T>) {
    const wrappedListener = (e: Event) => listener((e as CustomEvent).detail);
    this.listeners.set(listener, wrappedListener);
    this.target.addEventListener(EventDispatcher.eventName, wrappedListener);
  }

  removeListener(listener: EventListener<T>) {
    const wrappedListener = this.listeners.get(listener);
    if (wrappedListener) {
      this.target.removeEventListener(EventDispatcher.eventName, wrappedListener);
      this.listeners.delete(listener);
    }
  }

  dispatch(data: T) {
    this.target.dispatchEvent(new CustomEvent(EventDispatcher.eventName, { detail: data }));
  }
}

export function debounce<T>(func: (...args: T[]) => void, timeInMs: number = 100): (...args: T[]) => void {
  let timeout: number | undefined;
  return (...args: T[]) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), timeInMs);
  };
}
