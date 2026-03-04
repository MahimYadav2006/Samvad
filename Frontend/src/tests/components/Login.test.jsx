import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../helpers/renderWithProviders';
import Login from '../../pages/auth/Login';

// Mock dependencies
vi.mock('@phosphor-icons/react', () => ({
  EnvelopeSimpleIcon: (props) => <span data-testid="envelope-icon" {...props} />,
  LockIcon: (props) => <span data-testid="lock-icon" {...props} />,
  ShieldCheckeredIcon: (props) => <span data-testid="shield-icon" {...props} />,
  SparkleIcon: (props) => <span data-testid="sparkle-icon" {...props} />,
  ChatCircleDotsIcon: (props) => <span data-testid="chat-dots-icon" {...props} />,
  ChatTeardropTextIcon: (props) => <span data-testid="chat-teardrop-icon" {...props} />,
}));

vi.mock('../../utils/googleAuth', () => ({
  requestGoogleAccessToken: vi.fn(),
}));

describe('Login Page', () => {
  it('should render Sign In heading', () => {
    renderWithProviders(<Login />);
    const heading = screen.getByRole('heading', { name: /sign in/i });
    expect(heading).toBeInTheDocument();
  });

  it('should render email input', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('should render password input', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('should render Sign In button', () => {
    renderWithProviders(<Login />);
    const buttons = screen.getAllByRole('button');
    const signInButton = buttons.find((b) => b.textContent === 'Sign In');
    expect(signInButton).toBeInTheDocument();
  });

  it('should render Google sign-in button', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Sign In with Google')).toBeInTheDocument();
  });

  it('should render sign up link', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('should show validation errors for empty form submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const buttons = screen.getAllByRole('button');
    const signInButton = buttons.find((b) => b.textContent === 'Sign In');
    await user.click(signInButton);

    // After submission, validation errors should appear
    const errors = await screen.findAllByText(/required/i);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should have a form with email and password fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    // Verify both inputs accept user input
    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('user@test.com');
    expect(passwordInput).toHaveValue('password123');

    // Verify form structure
    const form = emailInput.closest('form');
    expect(form).toBeInTheDocument();
  });
});
