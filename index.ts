import { ResolvablePromise } from '../resolvable-promise/index.ts';

// const queueMicrotask = typeof globalThis.queueMicrotask === "function"
//   ? globalThis.queueMicrotask
//   : (callback: VoidFunction) => Promise.resolve().then(callback).catch(e => setTimeout(() => { throw e }));

export class ExtendablePromise<T = unknown> /* extends Promise<T[]> */ implements Promise<PromiseSettledResult<T>[]> {
  #values: PromiseSettledResult<T>[] = [];
  #promise: ResolvablePromise<PromiseSettledResult<T>[]>;
  #numAdded = 0;
  #numSettled = 0;

  constructor(f?: T | PromiseLike<T>) {
    // super(r => r(undefined as any));
    this.#promise = new ResolvablePromise();
    this.waitUntil(f);
    // queueMicrotask(() => {
    //   if (this.#numAdded === 0) {
    //     this.#promise.resolve([]);
    //   }
    // });
  }

  #fulfill(i: number, value: T) {
    this.#values[i] = { status: 'fulfilled', value };
    if (++this.#numSettled === this.#numAdded) {
      this.#promise.resolve(this.#values);
    }
  };

  #reject(i: number, reason: any) {
    this.#values[i] = { status: 'rejected', reason };
    if (++this.#numSettled === this.#numAdded) {
      this.#promise.resolve(this.#values);
    }
  };

  waitUntil(f?: T | PromiseLike<T>) {
    if ((<any>globalThis).process?.env?.NODE_ENV === 'development' || (<any>globalThis).DEBUG) {
      if (this.#promise.settled) {
        console.warn("Can't add promise to an ExtendablePromise that has already settled. This is a no-op");
      }
    }
    if (f) {
      const i = this.#numAdded;
      Promise.resolve(f)
        .then(v => this.#fulfill(i, v), r => this.#reject(i, r))
      this.#numAdded++;
    }
  };

  get settled() { return this.#promise.settled }

  then<TResult1 = PromiseSettledResult<T>[], TResult2 = never>(onfulfilled?: ((value: PromiseSettledResult<T>[]) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
    return this.#promise.then(onfulfilled, onrejected);
  }
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<PromiseSettledResult<T>[] | TResult> {
    return this.#promise.catch(onrejected);
  }
  finally(onfinally?: (() => void) | null): Promise<PromiseSettledResult<T>[]> {
    return this.#promise.finally(onfinally);
  }
  get [Symbol.toStringTag]() { return 'ExtendablePromise' }
}

// TODO: Not good for performance
// ExtendablePromise.prototype = Object.getPrototypeOf(Promise);
