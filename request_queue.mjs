// @ts-check
export class RequestQueue {
  #concurrency = 1;
  #processingCount = 0;
  /** @type {Array<() => Promise<unknown> | unknown>} */
  #queue = [];

  constructor(concurrency = 1) {
    this.#concurrency = concurrency;
  }

  /** @param {() => Promise<unknown> | unknown} fn */
  enqueue(fn) {
    this.#queue.push(fn);
    if (this.hasFreeSlot) {
      this.#processNext();
    }
  }

  async #processNext() {
    if (this.#queue.length > 0 && this.hasFreeSlot) {
      this.#processingCount++;
      const item = this.#queue.shift();
      await item?.();
      this.#processingCount--;
      await this.#processNext();
    }
  }

  get hasFreeSlot() {
    return this.#processingCount < this.#concurrency;
  }
}
