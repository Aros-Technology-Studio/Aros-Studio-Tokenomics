import {
  generateKeyPairSync,
  sign as cryptoSign,
  verify as cryptoVerify,
  createPrivateKey,
  createPublicKey,
  randomBytes,
  createHash,
} from 'crypto';

export interface KeyPair {
  keyId: string;
  publicKeyPem: string;
  privateKeyPem: string;
}

/** Generate Ed25519 key pair (real crypto, Node crypto). */
export function generateEd25519KeyPair(keyId = randomBytes(8).toString('hex')): KeyPair {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  return {
    keyId,
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  };
}

export function signContentHash(privateKeyPem: string, contentHashHex: string): string {
  const key = createPrivateKey(privateKeyPem);
  const sig = cryptoSign(null, Buffer.from(contentHashHex, 'hex'), key);
  return sig.toString('base64');
}

export function verifyContentHash(
  publicKeyPem: string,
  contentHashHex: string,
  signatureBase64: string,
): boolean {
  try {
    const key = createPublicKey(publicKeyPem);
    return cryptoVerify(
      null,
      Buffer.from(contentHashHex, 'hex'),
      key,
      Buffer.from(signatureBase64, 'base64'),
    );
  } catch {
    return false;
  }
}

export function fingerprintPublicKey(publicKeyPem: string): string {
  return createHash('sha256').update(publicKeyPem).digest('hex').slice(0, 16);
}
