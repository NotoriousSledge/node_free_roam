// @ts-check
import { randomUUID } from 'node:crypto';
import { parentPort, workerData } from 'node:worker_threads';
import path from 'node:path';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import web from 'node:stream/web';
import { finished } from 'node:stream/promises';
import { utimes } from 'node:fs/promises';

if (!parentPort) throw new Error('No parent port found!');
const decoder = new TextDecoder();

/** @typedef FileData @property {string} name @property {Date} modified */

/** @param {URL} url @returns {FileData} */
function getFname(url) {
  let fname = url.pathname.split('/').at(-1);
  if (!fname) {
    return { name: `${randomUUID()}.jpeg`, modified: new Date() };
  }

  if (fname.startsWith('P_')) {
    fname = fname.slice(2);
  }

  if (fname.startsWith('IMG_')) {
    fname = fname.slice(4);
  }

  const datePart = fname.split('.').at(0);
  if (!datePart) {
    return { name: `${fname}.jpeg`, modified: new Date() };
  }

  const date = new Date();
  date.setFullYear(
    Number(datePart.slice(0, 4)),
    Number(datePart.slice(4, 6)) - 1,
    Number(datePart.slice(6, 8))
  );

  date.setHours(
    Number(datePart.slice(9, 11)),
    Number(datePart.slice(11, 13)),
    Number(datePart.slice(13, 15))
  );

  return { name: fname, modified: date };
}

const downloadDir = workerData;
parentPort.on('message', async (bytes) => {
  const text = decoder.decode(/** @type {Uint8Array} */ (bytes));
  console.log('Worker received: ', text);

  try {
    const url = new URL(text);
    url.search = '';
    if (!url.pathname.endsWith('.jpg') && !url.pathname.endsWith('.jpeg')) {
      console.log('Illegal pathname', url.pathname);
      return;
    }

    const r = await fetch(url);
    if (!r.body || !r.ok) throw new Error('Could not fetch image.');
    const fname = getFname(url);
    console.log('Got fname: ', fname);
    const destination = path.join(downloadDir, fname.name);
    const b = /** @type {web.ReadableStream} */ (r.body);
    await finished(
      Readable.fromWeb(b).pipe(createWriteStream(destination, { flags: 'wx' }))
    );
    await utimes(destination, fname.modified, fname.modified);
    console.log(
      'Wrote image to ',
      destination,
      ' with modified time of ',
      fname.modified
    );
  } catch (e) {
    console.error('Something went wrong in the worker: ', e);
  }
});
