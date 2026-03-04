import { describe, it, expect } from 'vitest';
import { sanitizeToken, isJwtToken, toBearerHeader } from '../../utils/authToken';

describe('authToken utilities', () => {
  describe('sanitizeToken', () => {
    it('should return null for non-string input', () => {
      expect(sanitizeToken(null)).toBeNull();
      expect(sanitizeToken(undefined)).toBeNull();
      expect(sanitizeToken(123)).toBeNull();
      expect(sanitizeToken({})).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(sanitizeToken('')).toBeNull();
      expect(sanitizeToken('   ')).toBeNull();
    });

    it('should return null for "null" string', () => {
      expect(sanitizeToken('null')).toBeNull();
      expect(sanitizeToken('NULL')).toBeNull();
    });

    it('should return null for "undefined" string', () => {
      expect(sanitizeToken('undefined')).toBeNull();
      expect(sanitizeToken('UNDEFINED')).toBeNull();
    });

    it('should trim and return valid string', () => {
      expect(sanitizeToken('  abc  ')).toBe('abc');
    });
  });

  describe('isJwtToken', () => {
    it('should return true for valid JWT format', () => {
      const validJwt = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.abc123';
      expect(isJwtToken(validJwt)).toBe(true);
    });

    it('should return false for non-JWT strings', () => {
      expect(isJwtToken('not-a-jwt')).toBe(false);
      expect(isJwtToken('only.two')).toBe(false);
      expect(isJwtToken('')).toBe(false);
      expect(isJwtToken(null)).toBe(false);
      expect(isJwtToken(undefined)).toBe(false);
    });

    it('should return false for "null" string', () => {
      expect(isJwtToken('null')).toBe(false);
    });
  });

  describe('toBearerHeader', () => {
    it('should return bearer header for valid token', () => {
      expect(toBearerHeader('abc')).toBe('bearer abc');
    });

    it('should return null for invalid input', () => {
      expect(toBearerHeader(null)).toBeNull();
      expect(toBearerHeader('')).toBeNull();
      expect(toBearerHeader('null')).toBeNull();
    });
  });
});
