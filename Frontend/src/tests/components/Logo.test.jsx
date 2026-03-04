import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import Logo from '../../components/Logo';

// Mock phosphor icons
vi.mock('@phosphor-icons/react', () => ({
  ChatTeardropTextIcon: (props) => <span data-testid="chat-icon" {...props} />,
}));

describe('Logo Component', () => {
  it('should render logo text "Samvad"', () => {
    renderWithProviders(<Logo />);
    expect(screen.getByText('Samvad')).toBeInTheDocument();
  });

  it('should render the chat icon', () => {
    renderWithProviders(<Logo />);
    expect(screen.getByTestId('chat-icon')).toBeInTheDocument();
  });
});
