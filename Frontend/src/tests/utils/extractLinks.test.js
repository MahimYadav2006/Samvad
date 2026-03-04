import { describe, it, expect } from 'vitest';
import { extractLinks } from '../../utils/extractLinks';

describe('extractLinks utility', () => {
  it('should be importable', async () => {
    const mod = await import('../../utils/extractLinks');
    expect(mod).toBeDefined();
  });
});
