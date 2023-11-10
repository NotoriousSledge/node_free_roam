// @ts-check

import http from 'node:http';
import { parseIncomingMessage } from '../parse_incoming_message.mjs';
import { WorkerPool } from '../worker_pool.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pool = new WorkerPool(
  9,
  join(__dirname, 'worker.mjs'),
  join(process.env['userprofile'] ?? '/', 'downloads')
);
/** @param {number} port @returns {Promise<ReturnType<typeof http.createServer>>} **/
export function createServer(port) {
  return new Promise((r) => {
    const s = http
      .createServer(async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 200;
          res.end('<h1>Hej Balbina</h1>');
          return;
        }

        const response = await parseIncomingMessage(req);
        pool.postBuffer(await response.arrayBuffer());
        res.statusCode = 203;
        res.end('Enqueued');
      })
      .listen(port)
      .on('listening', () => {
        console.log(`Server listening on port ${port}`);
        r(s);
      });
  });
}
