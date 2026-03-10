import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateKeyPair,
  storePrivateKey,
  getStoredPrivateKey,
  hasStoredPrivateKey,
  encryptMessage,
  decryptMessage,
  initializeE2EEKeys,
} from '../../utils/encryption';

// ── Helpers ─────────────────────────────────────────────────────────────

/** Strip RSA private fields from a JWK to produce the public half */
const toPublicJwk = (privateJwk) => {
  const PRIVATE_FIELDS = ['d', 'dp', 'dq', 'p', 'q', 'qi'];
  const pub = Object.fromEntries(
    Object.entries(privateJwk).filter(([k]) => !PRIVATE_FIELDS.includes(k))
  );
  // The private JWK has key_ops: ["unwrapKey"], public needs ["wrapKey"]
  pub.key_ops = ['wrapKey'];
  return pub;
};

// ── Key-pair generation ─────────────────────────────────────────────────

describe('generateKeyPair', () => {
  it('should return publicKey and privateKey as JWK objects', async () => {
    const { publicKey, privateKey } = await generateKeyPair();

    expect(publicKey).toBeDefined();
    expect(privateKey).toBeDefined();

    // Both should be plain objects (JWK)
    expect(typeof publicKey).toBe('object');
    expect(typeof privateKey).toBe('object');
  });

  it('publicKey should have RSA-OAEP algorithm fields', async () => {
    const { publicKey } = await generateKeyPair();

    expect(publicKey.kty).toBe('RSA');
    expect(publicKey.alg).toBe('RSA-OAEP-256');
    expect(publicKey.n).toBeDefined(); // modulus
    expect(publicKey.e).toBeDefined(); // exponent
  });

  it('privateKey should contain RSA private fields', async () => {
    const { privateKey } = await generateKeyPair();

    expect(privateKey.d).toBeDefined();
    expect(privateKey.dp).toBeDefined();
    expect(privateKey.dq).toBeDefined();
    expect(privateKey.p).toBeDefined();
    expect(privateKey.q).toBeDefined();
    expect(privateKey.qi).toBeDefined();
  });

  it('each call should produce a unique key pair', async () => {
    const pair1 = await generateKeyPair();
    const pair2 = await generateKeyPair();

    expect(pair1.publicKey.n).not.toBe(pair2.publicKey.n);
    expect(pair1.privateKey.d).not.toBe(pair2.privateKey.d);
  });
});

// ── Local key storage ───────────────────────────────────────────────────

describe('private key storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('storePrivateKey persists key and getStoredPrivateKey retrieves it', () => {
    const fakeKey = { kty: 'RSA', n: 'abc', d: 'secret' };
    storePrivateKey('user1', fakeKey);

    const retrieved = getStoredPrivateKey('user1');
    expect(retrieved).toEqual(fakeKey);
  });

  it('getStoredPrivateKey returns null when no key is stored', () => {
    expect(getStoredPrivateKey('nonexistent')).toBeNull();
  });

  it('getStoredPrivateKey returns null for corrupted data', () => {
    localStorage.setItem('e2ee_privateKey_user1', 'not-valid-json{{{');
    expect(getStoredPrivateKey('user1')).toBeNull();
  });

  it('hasStoredPrivateKey returns correct boolean', () => {
    expect(hasStoredPrivateKey('user1')).toBe(false);

    storePrivateKey('user1', { test: true });
    expect(hasStoredPrivateKey('user1')).toBe(true);
  });

  it('keys are scoped to userId', () => {
    storePrivateKey('alice', { role: 'alice' });
    storePrivateKey('bob', { role: 'bob' });

    expect(getStoredPrivateKey('alice')).toEqual({ role: 'alice' });
    expect(getStoredPrivateKey('bob')).toEqual({ role: 'bob' });
  });
});

// ── Encrypt / Decrypt round-trip ────────────────────────────────────────

describe('encryptMessage + decryptMessage round-trip', () => {
  let aliceKeys;
  let bobKeys;

  beforeEach(async () => {
    aliceKeys = await generateKeyPair();
    bobKeys = await generateKeyPair();
  });

  it('sender (Alice) can decrypt her own message', async () => {
    const plaintext = 'Hello Bob!';
    const publicKeysMap = {
      alice: aliceKeys.publicKey,
      bob: bobKeys.publicKey,
    };

    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      plaintext,
      publicKeysMap
    );

    const decrypted = await decryptMessage(
      encryptedContent,
      iv,
      encryptedKeys.alice,
      aliceKeys.privateKey
    );

    expect(decrypted).toBe(plaintext);
  });

  it('receiver (Bob) can decrypt Alice\u2019s message', async () => {
    const plaintext = 'Hello Bob!';
    const publicKeysMap = {
      alice: aliceKeys.publicKey,
      bob: bobKeys.publicKey,
    };

    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      plaintext,
      publicKeysMap
    );

    const decrypted = await decryptMessage(
      encryptedContent,
      iv,
      encryptedKeys.bob,
      bobKeys.privateKey
    );

    expect(decrypted).toBe(plaintext);
  });

  it('encrypted content is not the same as the plaintext', async () => {
    const plaintext = 'secret message';
    const { encryptedContent } = await encryptMessage(plaintext, {
      alice: aliceKeys.publicKey,
    });

    expect(encryptedContent).not.toBe(plaintext);
  });

  it('each encryption produces unique ciphertext (random IV + AES key)', async () => {
    const plaintext = 'same message';
    const keysMap = { alice: aliceKeys.publicKey };

    const result1 = await encryptMessage(plaintext, keysMap);
    const result2 = await encryptMessage(plaintext, keysMap);

    expect(result1.encryptedContent).not.toBe(result2.encryptedContent);
    expect(result1.iv).not.toBe(result2.iv);
  });

  it('decryption with the wrong private key throws', async () => {
    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      'secret',
      { alice: aliceKeys.publicKey }
    );

    await expect(
      decryptMessage(encryptedContent, iv, encryptedKeys.alice, bobKeys.privateKey)
    ).rejects.toThrow();
  });

  it('handles empty string plaintext', async () => {
    const plaintext = '';
    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      plaintext,
      { alice: aliceKeys.publicKey }
    );

    const decrypted = await decryptMessage(
      encryptedContent,
      iv,
      encryptedKeys.alice,
      aliceKeys.privateKey
    );

    expect(decrypted).toBe('');
  });

  it('handles unicode / emoji plaintext', async () => {
    const plaintext = '🔐 Hello मित्र こんにちは 🎉';
    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      plaintext,
      { alice: aliceKeys.publicKey }
    );

    const decrypted = await decryptMessage(
      encryptedContent,
      iv,
      encryptedKeys.alice,
      aliceKeys.privateKey
    );

    expect(decrypted).toBe(plaintext);
  });

  it('handles long messages (>1 KB)', async () => {
    const plaintext = 'A'.repeat(2000);
    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      plaintext,
      { alice: aliceKeys.publicKey }
    );

    const decrypted = await decryptMessage(
      encryptedContent,
      iv,
      encryptedKeys.alice,
      aliceKeys.privateKey
    );

    expect(decrypted).toBe(plaintext);
  });

  it('skips participants with null public key', async () => {
    const { encryptedKeys } = await encryptMessage('test', {
      alice: aliceKeys.publicKey,
      bob: null,
    });

    expect(encryptedKeys.alice).toBeDefined();
    expect(encryptedKeys.bob).toBeUndefined();
  });
});

// ── Multi-participant scenario ──────────────────────────────────────────

describe('multi-participant encryption', () => {
  it('3 participants can all decrypt the same message', async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();
    const charlie = await generateKeyPair();

    const plaintext = 'Group hello!';
    const publicKeysMap = {
      alice: alice.publicKey,
      bob: bob.publicKey,
      charlie: charlie.publicKey,
    };

    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      plaintext,
      publicKeysMap
    );

    expect(Object.keys(encryptedKeys)).toHaveLength(3);

    for (const [name, keys] of [['alice', alice], ['bob', bob], ['charlie', charlie]]) {
      const decrypted = await decryptMessage(
        encryptedContent,
        iv,
        encryptedKeys[name],
        keys.privateKey
      );
      expect(decrypted).toBe(plaintext);
    }
  });
});

// ── Key rotation scenario ───────────────────────────────────────────────

describe('key rotation', () => {
  it('old messages cannot be decrypted after key rotation', async () => {
    const aliceOld = await generateKeyPair();
    const bob = await generateKeyPair();

    // Encrypt for Alice's OLD key
    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      'old secret',
      { alice: aliceOld.publicKey, bob: bob.publicKey }
    );

    // Alice regenerates keys (simulates key rotation)
    const aliceNew = await generateKeyPair();

    // Alice tries to decrypt with her NEW key — should fail
    await expect(
      decryptMessage(encryptedContent, iv, encryptedKeys.alice, aliceNew.privateKey)
    ).rejects.toThrow();

    // Bob can still decrypt with his unchanged key
    const decrypted = await decryptMessage(
      encryptedContent,
      iv,
      encryptedKeys.bob,
      bob.privateKey
    );
    expect(decrypted).toBe('old secret');
  });
});

// ── Public key derivation ───────────────────────────────────────────────

describe('public key derivation from private key', () => {
  it('stripping private fields from privateKey JWK produces a valid public key', async () => {
    const { publicKey, privateKey } = await generateKeyPair();

    // Derive public from private
    const derived = toPublicJwk(privateKey);

    // The derived public key should match the originally generated public key
    expect(derived.kty).toBe(publicKey.kty);
    expect(derived.n).toBe(publicKey.n);
    expect(derived.e).toBe(publicKey.e);
    expect(derived.alg).toBe(publicKey.alg);

    // It should NOT contain private fields
    expect(derived.d).toBeUndefined();
    expect(derived.dp).toBeUndefined();
    expect(derived.dq).toBeUndefined();
    expect(derived.p).toBeUndefined();
    expect(derived.q).toBeUndefined();
    expect(derived.qi).toBeUndefined();
  });

  it('encrypting with a derived public key can be decrypted with the original private key', async () => {
    const { privateKey } = await generateKeyPair();
    const derivedPub = toPublicJwk(privateKey);
    const bob = await generateKeyPair();

    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      'derived key test',
      { self: derivedPub, bob: bob.publicKey }
    );

    const decrypted = await decryptMessage(
      encryptedContent,
      iv,
      encryptedKeys.self,
      privateKey
    );
    expect(decrypted).toBe('derived key test');
  });
});

// ── initializeE2EEKeys ─────────────────────────────────────────────────

describe('initializeE2EEKeys', () => {
  let mockAxios;

  beforeEach(() => {
    localStorage.clear();
    mockAxios = {
      patch: vi.fn().mockResolvedValue({ data: { status: 'success' } }),
    };
  });

  it('does nothing when userId is falsy', async () => {
    await initializeE2EEKeys(null, 'token', mockAxios);
    expect(mockAxios.patch).not.toHaveBeenCalled();
    expect(hasStoredPrivateKey('null')).toBe(false);
  });

  it('does nothing when token is falsy', async () => {
    await initializeE2EEKeys('user1', null, mockAxios);
    expect(mockAxios.patch).not.toHaveBeenCalled();
  });

  it('generates and uploads new keys for a fresh user', async () => {
    await initializeE2EEKeys('user1', 'jwt-token', mockAxios);

    // Private key should be stored locally
    expect(hasStoredPrivateKey('user1')).toBe(true);
    const storedKey = getStoredPrivateKey('user1');
    expect(storedKey).toBeTruthy();
    expect(storedKey.d).toBeDefined(); // private field present

    // Public key should have been uploaded
    expect(mockAxios.patch).toHaveBeenCalledTimes(1);
    const [url, body, config] = mockAxios.patch.mock.calls[0];
    expect(url).toBe('/user/public-key');
    expect(body.publicKey).toBeDefined();
    expect(config.headers.authorization).toBe('bearer jwt-token');

    // Uploaded key should be a valid public JWK (no private fields)
    const uploadedKey = JSON.parse(body.publicKey);
    expect(uploadedKey.n).toBeDefined();
    expect(uploadedKey.d).toBeUndefined();
  });

  it('re-syncs public key when private key already exists', async () => {
    // Pre-store a private key
    const { privateKey } = await generateKeyPair();
    storePrivateKey('user1', privateKey);

    await initializeE2EEKeys('user1', 'jwt-token', mockAxios);

    // Should have called patch to re-upload
    expect(mockAxios.patch).toHaveBeenCalledTimes(1);
    const uploadedKey = JSON.parse(mockAxios.patch.mock.calls[0][1].publicKey);
    expect(uploadedKey.n).toBeDefined();
    expect(uploadedKey.d).toBeUndefined();
  });

  it('rolls back stored private key if upload fails for a new user', async () => {
    mockAxios.patch.mockRejectedValueOnce(new Error('Network error'));

    await initializeE2EEKeys('user1', 'jwt-token', mockAxios);

    // Private key should have been cleaned up
    expect(hasStoredPrivateKey('user1')).toBe(false);
  });

  it('does not remove existing private key if re-sync upload fails', async () => {
    const { privateKey } = await generateKeyPair();
    storePrivateKey('user1', privateKey);

    mockAxios.patch.mockRejectedValueOnce(new Error('Network error'));

    await initializeE2EEKeys('user1', 'jwt-token', mockAxios);

    // Private key should still exist (we don't delete on re-sync failure)
    expect(hasStoredPrivateKey('user1')).toBe(true);
  });
});

// ── Edge cases & tamper resistance ──────────────────────────────────────

describe('tamper resistance', () => {
  it('decryption fails if ciphertext is tampered', async () => {
    const keys = await generateKeyPair();
    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      'original',
      { user: keys.publicKey }
    );

    // Tamper: flip one character in the base64 ciphertext
    const tampered = encryptedContent.slice(0, -1) +
      (encryptedContent.slice(-1) === 'A' ? 'B' : 'A');

    await expect(
      decryptMessage(tampered, iv, encryptedKeys.user, keys.privateKey)
    ).rejects.toThrow();
  });

  it('decryption fails if IV is tampered', async () => {
    const keys = await generateKeyPair();
    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      'original',
      { user: keys.publicKey }
    );

    const tamperedIv = iv.slice(0, -1) + (iv.slice(-1) === 'A' ? 'B' : 'A');

    await expect(
      decryptMessage(encryptedContent, tamperedIv, encryptedKeys.user, keys.privateKey)
    ).rejects.toThrow();
  });

  it('decryption fails if wrapped key is tampered', async () => {
    const keys = await generateKeyPair();
    const { encryptedContent, iv, encryptedKeys } = await encryptMessage(
      'original',
      { user: keys.publicKey }
    );

    const tamperedWrappedKey = encryptedKeys.user.slice(0, -1) +
      (encryptedKeys.user.slice(-1) === 'A' ? 'B' : 'A');

    await expect(
      decryptMessage(encryptedContent, iv, tamperedWrappedKey, keys.privateKey)
    ).rejects.toThrow();
  });
});
