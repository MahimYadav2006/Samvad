import { describe, it, expect } from 'vitest';

describe('extractLinks utility', () => {
  it('should be importable', async () => {
    const mod = await import('../../utils/extractLinks');
    expect(mod).toBeDefined();
  });
});
