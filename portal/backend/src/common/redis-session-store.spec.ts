import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RedisSessionStore } from './redis-session-store';

describe('RedisSessionStore (I2)', () => {
  it('fromEnv null without REDIS_URL', () => {
    assert.equal(RedisSessionStore.fromEnv({}), null);
  });

  it('fromEnv constructs when URL set', () => {
    const s = RedisSessionStore.fromEnv({ REDIS_URL: 'redis://127.0.0.1:6379' });
    assert.ok(s);
  });
});
