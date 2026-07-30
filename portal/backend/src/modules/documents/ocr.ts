/**
 * D5 — optional OCR for image-only packages.
 * Prefer AST_OCR_CMD or tesseract on PATH. Never invent valuations.
 */
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export type ImageKind = 'png' | 'jpeg' | 'webp' | 'tiff' | 'gif' | null;

export function detectImageKind(buf: Buffer, fileName?: string): ImageKind {
  const name = (fileName ?? '').toLowerCase();
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'png';
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'jpeg';
  }
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  if (
    buf.length >= 4 &&
    ((buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2a && buf[3] === 0x00) ||
      (buf[0] === 0x4d && buf[1] === 0x4d && buf[2] === 0x00 && buf[3] === 0x2a))
  ) {
    return 'tiff';
  }
  if (buf.length >= 6 && buf.toString('ascii', 0, 6) === 'GIF87a') return 'gif';
  if (buf.length >= 6 && buf.toString('ascii', 0, 6) === 'GIF89a') return 'gif';

  if (name.endsWith('.png')) return 'png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'jpeg';
  if (name.endsWith('.webp')) return 'webp';
  if (name.endsWith('.tif') || name.endsWith('.tiff')) return 'tiff';
  if (name.endsWith('.gif')) return 'gif';
  return null;
}

export function ocrDisabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.AST_OCR_DISABLED === '1' || env.AST_OCR_DISABLED === 'true';
}

function commandAvailable(bin: string): boolean {
  try {
    const r = spawnSync(bin, ['--version'], { encoding: 'utf8', timeout: 3000 });
    return r.status === 0 || r.status === 1; // tesseract prints version to stderr sometimes
  } catch {
    return false;
  }
}

/**
 * Run OCR. Returns null if disabled or no engine / failure.
 */
export function runOcrOnImage(
  buf: Buffer,
  kind: ImageKind,
  env: NodeJS.ProcessEnv = process.env,
): { text: string; engine: string } | null {
  if (ocrDisabled(env) || !kind) return null;

  const ext =
    kind === 'jpeg' ? 'jpg' : kind === 'tiff' ? 'tif' : kind === 'webp' ? 'webp' : kind === 'gif' ? 'gif' : 'png';
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-ocr-'));
  const input = path.join(tmpDir, `scan.${ext}`);
  try {
    fs.writeFileSync(input, buf);

    const custom = env.AST_OCR_CMD?.trim();
    if (custom) {
      // Template: "myocr {input}" — must print text to stdout
      const parts = custom.split(/\s+/).map((p) => p.replaceAll('{input}', input));
      const bin = parts[0];
      const args = parts.slice(1);
      const r = spawnSync(bin, args, { encoding: 'utf8', timeout: 60_000, maxBuffer: 8 * 1024 * 1024 });
      if (r.status === 0 && (r.stdout ?? '').trim()) {
        return { text: r.stdout, engine: `cmd:${bin}` };
      }
      return null;
    }

    if (commandAvailable('tesseract')) {
      const lang = env.AST_OCR_LANG?.trim() || 'eng';
      const r = spawnSync('tesseract', [input, 'stdout', '-l', lang], {
        encoding: 'utf8',
        timeout: 60_000,
        maxBuffer: 8 * 1024 * 1024,
      });
      // tesseract may return 0 with text on stdout
      const out = (r.stdout ?? '').trim();
      if (out) return { text: r.stdout ?? '', engine: `tesseract:${lang}` };
    }

    return null;
  } catch {
    return null;
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

/** For tests: avoid real process spawn */
export function runOcrWithRunner(
  buf: Buffer,
  kind: ImageKind,
  runner: (inputPath: string) => string | null,
): { text: string; engine: string } | null {
  if (!kind) return null;
  const ext = kind === 'jpeg' ? 'jpg' : 'png';
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-ocr-test-'));
  const input = path.join(tmpDir, `scan.${ext}`);
  try {
    fs.writeFileSync(input, buf);
    const text = runner(input);
    if (text?.trim()) return { text, engine: 'test-runner' };
    return null;
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

