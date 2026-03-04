import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../helpers/renderWithProviders';
import Signup from '../../pages/auth/Signup';

vi.mock('@phosphor-icons/react', () => ({
  UserIcon: (props) => <span data-testid="user-icon" {...props} />,
  EnvelopeSimpleIcon: (props) => <span data-testid="envelope-icon" {...props} />,
  LockIcon: (props) => <span data-testid="lock-icon" {...props} />,
  RocketLaunchIcon: (props) => <span data-testid="rocket-icon" {...props} />,
  UsersThreeIcon: (props) => <span data-testid="users-icon" {...props} />,
  ClockCountdownIcon: (props) => <span data-testid="clock-icon" {...props} />,
  ChatTeardropTextIcon: (props) => <span data-testid="chat-icon" {...props} />,
}));

vi.mock('../../utils/googleAuth', () => ({
  requestGoogleAccessToken: vi.fn(),
}));

describe('Signup Page', () => {
  it('should render Sign Up heading', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Choose a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter password')).toBeInTheDocument();
  });

  it('should render Sign Up button', () => {
    renderWithProviders(<Signup />);
    const buttons = screen.getAllByRole('button');
    const signUpButton = buttons.find((b) => b.textContent === 'Sign Up');
    expect(signUpButton).toBeInTheDocument();
  });

  it('should render Google sign-up button', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByText('Sign Up with Google')).toBeInTheDocument();
  });

  it('should render sign in link', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should show validation errors on empty submit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Signup />);

    const buttons = screen.getAllByRole('button');
    const signUpButton = buttons.find((b) => b.textContent === 'Sign Up');
    await user.click(signUpButton);

    const errors = await screen.findAllByText(/required/i);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should validate password match', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Signup />);

    await user.type(screen.getByPlaceholderText('Your full name'), 'Test');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Choose a password'), 'password123');
    await user.type(screen.getByPlaceholderText('Re-enter password'), 'different123');

    const buttons = screen.getAllByRole('button');
    const signUpButton = buttons.find((b) => b.textContent === 'Sign Up');
    await user.click(signUpButton);

    const error = await screen.findByText(/must match/i);
    expect(error).toBeInTheDocument();
  });

  it('should validate minimum password length', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Signup />);

    await user.type(screen.getByPlaceholderText('Choose a password'), 'ab');

    const buttons = screen.getAllByRole('button');
    const signUpButton = buttons.find((b) => b.textContent === 'Sign Up');
    await user.click(signUpButton);

    const error = await screen.findByText(/at least 6/i);
    expect(error).toBeInTheDocument();
  });
});
