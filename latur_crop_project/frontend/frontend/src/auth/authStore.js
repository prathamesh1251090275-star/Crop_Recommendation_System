/**
 * Local account store for Peek Mitra.
 *
 * Passwords are never stored: each account keeps a random 16-byte salt and a
 * PBKDF2-SHA256 hash (150k iterations) derived with the Web Crypto API. The
 * session lives in sessionStorage and expires after 12 hours.
 *
 * This is client-side authentication: it gates the UI and keeps passwords out
 * of plain text, but it cannot protect data from someone with access to the
 * browser profile. A production deployment should replace this module with a
 * server-backed auth service while keeping the same interface.
 */

const USERS_KEY = 'pm_auth_users';
const SESSION_KEY = 'pm_auth_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 150000;
const MIN_PASSWORD = 6;

const toB64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromB64 = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function derive(password, saltBytes) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('insecure-context');
  }
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return toB64(bits);
}

function startSession(user) {
  const session = { email: user.email, name: user.name, expiresAt: Date.now() + SESSION_TTL_MS };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/** Returns the live session, or null when missing/expired. */
export function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.email || !session.expiresAt || session.expiresAt < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function accountCount() {
  return Object.keys(readUsers()).length;
}

export async function signup({ name, email, password }) {
  const cleanEmail = normalizeEmail(email);
  const cleanName = String(name || '').trim();

  if (!cleanName) throw new Error('name-required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error('email-invalid');
  if (String(password || '').length < MIN_PASSWORD) throw new Error('password-short');

  const users = readUsers();
  if (users[cleanEmail]) throw new Error('account-exists');

  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  users[cleanEmail] = {
    name: cleanName,
    salt: toB64(salt),
    hash,
    iterations: PBKDF2_ITERATIONS,
    createdAt: new Date().toISOString(),
  };
  writeUsers(users);
  return startSession({ email: cleanEmail, name: cleanName });
}

export async function login({ email, password }) {
  const cleanEmail = normalizeEmail(email);
  const users = readUsers();
  const record = users[cleanEmail];
  if (!record) throw new Error('account-missing');

  const hash = await derive(password, fromB64(record.salt));
  if (hash !== record.hash) throw new Error('password-wrong');

  return startSession({ email: cleanEmail, name: record.name });
}
