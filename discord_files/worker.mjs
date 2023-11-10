// @ts-check
import {parentPort} from 'node:worker_threads';

if (!parentPort) throw new Error('No parent port found!');
const decoder = new TextDecoder();
parentPort.on('message', (stream) => {
  /** @type {Uint8Array} */
  const bytes = stream;
  const text = decoder.decode(bytes);
  console.log('Worker received: ', text);
});
