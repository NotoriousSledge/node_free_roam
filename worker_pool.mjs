// @ts-check

import { Worker } from 'node:worker_threads';
import { RequestQueue } from './request_queue.mjs';
export class WorkerPool {
  #workers;
  #currentWorker = 0;
  #queue = new RequestQueue(1);

  /** @param {number} length @param {string} workerPath @param {any} data  */
  constructor(length, workerPath, data) {
    this.#workers = Array.from(
      { length },
      () => new Worker(workerPath, { workerData: data })
    );
  }

  /** @param {ArrayBuffer} buffer */
  postBuffer(buffer) {
    const bytes = new Uint8Array(buffer);
    this.#queue.enqueue(() => this.#postBytes(bytes));
  }

  /** @param {Uint8Array} bytes */
  #postBytes(bytes) {
    this.#workers[this.#currentWorker++].postMessage(bytes, [bytes.buffer]);
    if (this.#currentWorker >= this.#workers.length) {
      this.#currentWorker = 0;
    }
  }

  close() {
    for (let i = 0; i < this.#workers.length; i++) {
      this.#queue.enqueue(() => this.#workers[i].terminate());
    }
  }
}
