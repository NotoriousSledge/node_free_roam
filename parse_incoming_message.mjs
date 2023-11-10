import {IncomingMessage} from 'http';

/**
 * @description - Reads an incoming message into a Response object,
 * which allows for easy parsing into text, json, formdata and binary.
 * @param {IncomingMessage} req - The incoming message to parse
 * @returns {Promise<Response>} - A promise that resolves to a Response object
 */
export function parseIncomingMessage(req) {
  return new Promise((resolve, reject) => {
    const stream = new ReadableStream({
      start(controller) {
        req.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        req.on('end', () => {
          controller.close();
          return resolve(new Response(stream));
        });
        req.on('error', (err) => {
          controller.error(err);
          return reject(err);
        });
      },
    });
  });
}
