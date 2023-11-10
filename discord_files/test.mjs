import $ from 'node:test';
import assert from 'node:assert';
import {createServer} from './server.mjs';

$.test('discord_files', async () => {
  await $.it('should work', async () => {
    await createServer(3000);

    const p = await fetch('http://localhost:3000', {
      method: 'POST',
      body: 'ass',
    });

    assert.strictEqual(p.status, 203);
  });
});
