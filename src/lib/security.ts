/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        security.ts
 * @description Provides local hashing and verification helpers for security codes.
 *
 * @project     BlockyNotes
 * @module      Core / Utilities
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-05-11
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
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
