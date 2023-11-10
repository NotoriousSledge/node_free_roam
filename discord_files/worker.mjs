// @ts-check
import { randomUUID } from 'node:crypto';
import { parentPort, workerData } from 'node:worker_threads';
import path from 'node:path';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import web from 'node:stream/web';
import { finished } from 'node:stream/promises';

if (!parentPort) throw new Error('No parent port found!');
const decoder = new TextDecoder();

const downloadDir = workerData;
parentPort.on('message', async (bytes) => {
  const text = decoder.decode(/** @type {Uint8Array} */ (bytes));
  console.log('Worker received: ', text);
  try {
    const url = new URL(text);
    url.search = '';
    const r = await fetch(url);
    if (!r.body || !r.ok) throw new Error('Could not fetch image.');
    const fname = path.join(downloadDir, `${randomUUID()}.jpeg`);
    const b = /** @type {web.ReadableStream} */ (r.body);
    await finished(
      Readable.fromWeb(b).pipe(createWriteStream(fname, { flags: 'wx' }))
    );
    console.log('Wrote image to ', fname);
  } catch (e) {
    console.error('Something went wrong in the worker: ', e);
  }
});
