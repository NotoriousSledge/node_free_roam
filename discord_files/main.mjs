// @ts-check

import { createServer } from './server.mjs';
process.on('warning', (e) => console.warn(e.stack));
await createServer(3000);
