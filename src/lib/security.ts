const lockHashSalt = "blockynotes-lock-v1";

export const normalizeLockCode = (code: string) => code.replace(/\D/g, "").slice(0, 8);

export const isValidLockCode = (code: string) => normalizeLockCode(code).length >= 4;

export const hashLockCode = (code: string) => {
  const normalizedCode = normalizeLockCode(code);
  let hash = 2166136261;

  for (const char of `${lockHashSalt}:${normalizedCode}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a:${(hash >>> 0).toString(16)}`;
};

export const verifyLockCode = (code: string, expectedHash?: string | null) =>
  Boolean(expectedHash) && hashLockCode(code) === expectedHash;
