import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ChatHeader from '../../section/chat/ChatHeader';

vi.mock('../../context/CallContext', () => ({
  useCall: () => ({ initiateCall: vi.fn() }),
}));

vi.mock('react-icons/fi', () => ({
  FiVideo: () => <span data-testid="video-icon" />,
  FiPhone: () => <span data-testid="phone-icon" />,
  FiMoreVertical: () => <span data-testid="more-icon" />,
}));

describe('ChatHeader Component', () => {
  const mockUser = {
    _id: 'user1',
    name: 'Alice',
    online: true,
  };

  it('should render user name', () => {
    renderWithProviders(<ChatHeader selectedUser={mockUser} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('should display online status', () => {
    renderWithProviders(<ChatHeader selectedUser={mockUser} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should display offline status', () => {
    renderWithProviders(<ChatHeader selectedUser={{ ...mockUser, online: false }} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should render call buttons', () => {
    renderWithProviders(<ChatHeader selectedUser={mockUser} />);
    expect(screen.getByTitle('Audio Call')).toBeInTheDocument();
    expect(screen.getByTitle('Video Call')).toBeInTheDocument();
  });

  it('should render first letter avatar', () => {
    renderWithProviders(<ChatHeader selectedUser={mockUser} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should return null when no selectedUser', () => {
    const { container } = renderWithProviders(<ChatHeader selectedUser={null} />);
    expect(container.innerHTML).toBe('');
  });
});
