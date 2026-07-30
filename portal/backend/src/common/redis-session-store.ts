/**
 * I2 — optional Redis-backed session blob store (portal edge).
 * Not SoT. When REDIS_URL is unset, callers keep in-memory Map.
 *
 * Uses raw RESP over TCP (SET/GET/DEL/EXPIRE) — no redis npm dependency.
 */
import * as net from 'net';

export class RedisSessionStore {
  constructor(
    private readonly url: string,
    private readonly keyPrefix = 'ast:session:',
  ) {}

  static fromEnv(env: NodeJS.ProcessEnv = process.env): RedisSessionStore | null {
    const url = env.REDIS_URL?.trim();
    if (!url) return null;
    return new RedisSessionStore(url);
  }

  private connect(): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
      let u: URL;
      try {
        u = new URL(this.url);
      } catch {
        reject(new Error('invalid REDIS_URL'));
        return;
      }
      const host = u.hostname || '127.0.0.1';
      const port = Number(u.port || 6379);
      const sock = net.createConnection({ host, port }, () => resolve(sock));
      sock.setTimeout(3000);
      sock.on('error', reject);
      sock.on('timeout', () => {
        sock.destroy();
        reject(new Error('redis timeout'));
      });
    });
  }

  private async command(args: string[]): Promise<string> {
    const sock = await this.connect();
    try {
      const payload =
        `*${args.length}\r\n` +
        args.map((a) => `$${Buffer.byteLength(a)}\r\n${a}\r\n`).join('');
      const reply = await new Promise<string>((resolve, reject) => {
        let buf = '';
        sock.on('data', (d) => {
          buf += d.toString('utf8');
          if (buf.includes('\r\n')) {
            resolve(buf);
            sock.end();
          }
        });
        sock.on('error', reject);
        sock.write(payload);
      });
      return reply;
    } finally {
      sock.destroy();
    }
  }

  async setJson(sessionId: string, value: unknown, ttlSec: number): Promise<void> {
    const key = this.keyPrefix + sessionId;
    const raw = JSON.stringify(value);
    await this.command(['SET', key, raw, 'EX', String(ttlSec)]);
  }

  async getJson<T>(sessionId: string): Promise<T | null> {
    const key = this.keyPrefix + sessionId;
    const reply = await this.command(['GET', key]);
    // Simple bulk string parse: $n\r\n<body>\r\n or $-1
    if (reply.startsWith('$-1')) return null;
    const m = reply.match(/^\$(\d+)\r\n([\s\S]*)$/);
    if (!m) return null;
    const n = Number(m[1]);
    const body = m[2].slice(0, n);
    try {
      return JSON.parse(body) as T;
    } catch {
      return null;
    }
  }

  async del(sessionId: string): Promise<void> {
    const key = this.keyPrefix + sessionId;
    await this.command(['DEL', key]);
  }
}
