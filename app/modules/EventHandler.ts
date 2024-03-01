export type Delegate<T> = (args: T) => void;

class EventHandler<T> {
  private delegates: Delegate<T>[] = [];

  invoke(args: T) {
    this.delegates.slice().forEach((d) => d(args));
  }

  add(delegate: Delegate<T>) {
    this.delegates.push(delegate);

    return () => this.remove(delegate);
  }

  remove(delegate: Delegate<T>) {
    this.delegates.splice(this.delegates.indexOf(delegate), 1);
  }

  clear() {
    this.delegates = [];
  }
}

export default EventHandler;
