/**
 * End-to-End Encryption utilities using Web Crypto API.
 *
 * Hybrid scheme:
 *   - A random AES-256-GCM key encrypts the message content.
 *   - The AES key is then wrapped (encrypted) with RSA-OAEP for each
 *     participant so every party can decrypt later.
 *
 * Storage:
 *   - publicKey  → sent to backend (JWK JSON string)
 *   - privateKey → localStorage keyed by `e2ee_privateKey_<userId>`
 */

const RSA_ALGORITHM = {
  name: "RSA-OAEP",
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
};

const AES_ALGORITHM = { name: "AES-GCM", length: 256 };

// ── Key pair generation ─────────────────────────────────────────────────

/**
 * Generate an RSA-OAEP key pair and return both keys as JWK objects.
 * @returns {Promise<{publicKey: object, privateKey: object}>}
 */
export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    RSA_ALGORITHM,
    true, // extractable
    ["wrapKey", "unwrapKey"]
  );

  const publicKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return { publicKey, privateKey };
}

// ── Local key storage helpers ───────────────────────────────────────────

const PRIVATE_KEY_PREFIX = "e2ee_privateKey_";

export function storePrivateKey(userId, privateKeyJwk) {
  localStorage.setItem(
    `${PRIVATE_KEY_PREFIX}${userId}`,
    JSON.stringify(privateKeyJwk)
  );
}

export function getStoredPrivateKey(userId) {
  const raw = localStorage.getItem(`${PRIVATE_KEY_PREFIX}${userId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasStoredPrivateKey(userId) {
  return localStorage.getItem(`${PRIVATE_KEY_PREFIX}${userId}`) !== null;
}

// ── Import helpers ──────────────────────────────────────────────────────

async function importPublicKey(jwk) {
  return window.crypto.subtle.importKey(
    "jwk",
    jwk,
    RSA_ALGORITHM,
    true,
    ["wrapKey"]
  );
}

async function importPrivateKey(jwk) {
  return window.crypto.subtle.importKey(
    "jwk",
    jwk,
    RSA_ALGORITHM,
    true,
    ["unwrapKey"]
  );
}

// ── Encrypt a message for multiple recipients ───────────────────────────

/**
 * Encrypt a plaintext message so that each listed recipient (and sender)
 * can decrypt it using their own private key.
 *
 * @param {string} plaintext         – the message to encrypt
 * @param {Object} publicKeysMap     – { [userId]: publicKeyJwk }
 * @returns {Promise<{encryptedContent: string, iv: string, encryptedKeys: Object}>}
 *   encryptedContent – base64 AES-GCM ciphertext
 *   iv               – base64 initialisation vector
 *   encryptedKeys    – { [userId]: base64-wrapped AES key }
 */
export async function encryptMessage(plaintext, publicKeysMap) {
  // 1. Generate a random AES-GCM key
  const aesKey = await window.crypto.subtle.generateKey(AES_ALGORITHM, true, [
    "encrypt",
    "decrypt",
  ]);

  // 2. Encrypt the plaintext with AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoded
  );

  // 3. Wrap (RSA-OAEP encrypt) the AES key for each participant
  const encryptedKeys = {};
  for (const [userId, pubJwk] of Object.entries(publicKeysMap)) {
    if (!pubJwk) continue;
    const pubCryptoKey = await importPublicKey(pubJwk);
    const wrappedKey = await window.crypto.subtle.wrapKey(
      "raw",
      aesKey,
      pubCryptoKey,
      { name: "RSA-OAEP" }
    );
    encryptedKeys[userId] = arrayBufferToBase64(wrappedKey);
  }

  return {
    encryptedContent: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
    encryptedKeys,
  };
}

// ── Decrypt a message ───────────────────────────────────────────────────

/**
 * Decrypt ciphertext using the current user's private key.
 *
 * @param {string} encryptedContent  – base64 AES-GCM ciphertext
 * @param {string} iv                – base64 initialisation vector
 * @param {string} wrappedKeyB64     – base64 RSA-OAEP wrapped AES key (for this user)
 * @param {object} privateKeyJwk     – the user's RSA private key in JWK format
 * @returns {Promise<string>}        – decrypted plaintext
 */
export async function decryptMessage(encryptedContent, iv, wrappedKeyB64, privateKeyJwk) {
  const privCryptoKey = await importPrivateKey(privateKeyJwk);

  // Unwrap the AES key
  const wrappedKeyBuf = base64ToArrayBuffer(wrappedKeyB64);
  const aesKey = await window.crypto.subtle.unwrapKey(
    "raw",
    wrappedKeyBuf,
    privCryptoKey,
    { name: "RSA-OAEP" },
    AES_ALGORITHM,
    true,
    ["decrypt"]
  );

  // Decrypt the ciphertext
  const ivBuf = base64ToArrayBuffer(iv);
  const ciphertextBuf = base64ToArrayBuffer(encryptedContent);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuf },
    aesKey,
    ciphertextBuf
  );

  return new TextDecoder().decode(decrypted);
}

// ── Base64 helpers ──────────────────────────────────────────────────────

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ── Derive public JWK from private JWK ──────────────────────────────────

/**
 * Derive the public-key JWK from a private-key JWK.
 * We import the full private JWK as a key-pair and then export only the
 * public half — this avoids storing the public key separately.
 */
async function derivePublicFromPrivate(privateKeyJwk) {
  // A JWK public key is the private key without the RSA private fields
  const RSA_PRIVATE_FIELDS = ["d", "dp", "dq", "p", "q", "qi"];
  const publicJwk = Object.fromEntries(
    Object.entries(privateKeyJwk).filter(([key]) => !RSA_PRIVATE_FIELDS.includes(key))
  );
  // The private JWK has key_ops: ["unwrapKey"], but the public key needs ["wrapKey"]
  publicJwk.key_ops = ["wrapKey"];
  // Verify it is importable as a public key
  await window.crypto.subtle.importKey("jwk", publicJwk, RSA_ALGORITHM, true, ["wrapKey"]);
  return publicJwk;
}

// ── Initialization helper ───────────────────────────────────────────────

/**
 * Generate and persist E2EE keys for a user if they don't already exist.
 * If they already exist locally, re-uploads the public key to the backend
 * to handle the case where the initial upload silently failed.
 *
 * @param {string} userId
 * @param {string} token   – JWT bearer token
 * @param {function} axiosInstance – configured axios instance
 */
export async function initializeE2EEKeys(userId, token, axiosInstance) {
  if (!userId || !token) return;

  if (hasStoredPrivateKey(userId)) {
    // Keys already exist locally — re-sync the public key to the backend
    // in case the initial upload failed or was lost.
    try {
      const privateKeyJwk = getStoredPrivateKey(userId);
      if (privateKeyJwk) {
        const publicKey = await derivePublicFromPrivate(privateKeyJwk);
        await axiosInstance.patch(
          "/user/public-key",
          { publicKey: JSON.stringify(publicKey) },
          { headers: { authorization: `bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error("[E2EE] Failed to re-sync public key to backend:", err);
    }
    return;
  }

  try {
    const { publicKey, privateKey } = await generateKeyPair();
    storePrivateKey(userId, privateKey);

    await axiosInstance.patch(
      "/user/public-key",
      { publicKey: JSON.stringify(publicKey) },
      { headers: { authorization: `bearer ${token}` } }
    );
  } catch (err) {
    console.error("[E2EE] Failed to initialize encryption keys:", err);
    // If the key upload failed, remove the stored private key so that
    // the next login attempt will re-generate and re-upload.
    localStorage.removeItem(`${PRIVATE_KEY_PREFIX}${userId}`);
  }
}
