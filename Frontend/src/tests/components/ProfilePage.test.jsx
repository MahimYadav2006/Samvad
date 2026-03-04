import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ProfilePage from '../../pages/ProfilePage';

// Mock the sub-forms to isolate ProfilePage logic
vi.mock('../../section/Profile/ProfileForm', () => ({
  default: () => <div data-testid="profile-form">Profile Form</div>,
}));

vi.mock('../../section/Profile/UpdatePasswordForm', () => ({
  default: () => <div data-testid="password-form">Password Form</div>,
}));

describe('ProfilePage', () => {
  it('should render with Settings heading', () => {
    renderWithProviders(<ProfilePage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should show Profile tab content by default', () => {
    renderWithProviders(<ProfilePage />);
    expect(screen.getByTestId('profile-form')).toBeInTheDocument();
  });

  it('should show Update Password form when tab is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    await user.click(screen.getByText('Update Password'));
    expect(screen.getByTestId('password-form')).toBeInTheDocument();
  });

  it('should switch back to Profile tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    await user.click(screen.getByText('Update Password'));
    await user.click(screen.getByText('Profile'));
    expect(screen.getByTestId('profile-form')).toBeInTheDocument();
  });

  it('should render both tab buttons', () => {
    renderWithProviders(<ProfilePage />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Update Password')).toBeInTheDocument();
  });
});
