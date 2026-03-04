import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../helpers/renderWithProviders';
import Protect from '../../utils/Protect';

describe('Protect Component', () => {
  it('should redirect to login when not authenticated', () => {
    renderWithProviders(
      <Protect>
        <div>Protected Content</div>
      </Protect>,
      {
        preloadedState: {
          auth: {
            isLoading: false,
            error: null,
            token: null,
            user: {},
            isLoggedIn: false,
          },
        },
      }
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', () => {
    renderWithProviders(
      <Protect>
        <div>Protected Content</div>
      </Protect>,
      {
        preloadedState: {
          auth: {
            isLoading: false,
            error: null,
            token: 'eyJhbGciOiJIUzI1NiJ9.eyJ0ZXN0IjoiMSJ9.abc123',
            user: { _id: '123' },
            isLoggedIn: true,
          },
        },
      }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when token is "null" string', () => {
    renderWithProviders(
      <Protect>
        <div>Protected Content</div>
      </Protect>,
      {
        preloadedState: {
          auth: {
            isLoading: false,
            error: null,
            token: 'null',
            user: {},
            isLoggedIn: false,
          },
        },
      }
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
