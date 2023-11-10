import $ from 'node:test';
import assert from 'node:assert';
import { createServer } from './server.mjs';

$.test('discord_files', async () => {
  await $.it('should work', async () => {
    await createServer(3000);

    const p = await fetch('http://localhost:3000', {
      method: 'POST',
      body: 'https://media.discordapp.net/attachments/1080099396307390544/1172072856499265606/20231108_123024.jpg?ex=655efce9&is=654c87e9&hm=6c958c524458fdbfa5ff8ef1bd6c17fe4c63a454f72fb3861f14bc50fc6c753a&=&width=550&height=350',
    });

    assert.strictEqual(p.status, 203);
  });
});
