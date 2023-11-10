// @ts-check

import { Worker } from 'node:worker_threads';
export class WorkerPool {
  #workers;
  #currentWorker = 0;

  /** @param {number} length @param {string} workerPath */
  constructor(length, workerPath) {
    this.#workers = Array.from({ length }, () => new Worker(workerPath));
  }

  /** @param {ArrayBuffer} buffer */
  postBuffer(buffer) {
    const bytes = new Uint8Array(buffer);
    this.#workers[this.#currentWorker++].postMessage(bytes, [bytes.buffer]);
    if (this.#currentWorker >= this.#workers.length) {
      this.#currentWorker = 0;
    }
  }

  close() {
    for (let i = 0; i < this.#workers.length; i++) {
      void this.#workers[i].terminate();
    }
  }
}
