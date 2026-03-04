import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import Layout from '../../layout/index';

// Mock Sidebar and Outlet
vi.mock('../../layout/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

describe('Layout Component', () => {
  it('should render sidebar', () => {
    renderWithProviders(<Layout />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('should render outlet', () => {
    renderWithProviders(<Layout />);
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('should have main element', () => {
    renderWithProviders(<Layout />);
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });
});
