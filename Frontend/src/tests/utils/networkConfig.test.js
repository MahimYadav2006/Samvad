import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to mock import.meta.env before importing
vi.stubEnv('VITE_BACKEND_URL', '');

describe('networkConfig utilities', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    window.__SAMVAD_CONFIG__ = {};
  });

  it('should return default backend URL when VITE_BACKEND_URL is empty', async () => {
    vi.stubEnv('VITE_BACKEND_URL', '');
    // Re-import to get fresh module
    const { getBackendUrl } = await import('../../utils/networkConfig');
    const url = getBackendUrl();
    expect(url).toBe('http://localhost:8000');
  });

  it('should return configured backend URL', async () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://myserver.com:3000');
    const mod = await import('../../utils/networkConfig');
    expect(mod.getBackendUrl()).toBe('http://myserver.com:3000');
  });

  it('should prioritize runtime config over build-time env', async () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://env.example.com');
    window.__SAMVAD_CONFIG__ = {
      VITE_BACKEND_URL: 'https://runtime.example.com',
    };
    const { getBackendUrl } = await import('../../utils/networkConfig');
    expect(getBackendUrl()).toBe('https://runtime.example.com');
  });

  it('should export getWebRtcIceServers function', async () => {
    const { getWebRtcIceServers } = await import('../../utils/networkConfig');
    expect(typeof getWebRtcIceServers).toBe('function');
    const servers = getWebRtcIceServers();
    expect(Array.isArray(servers)).toBe(true);
  });
});
