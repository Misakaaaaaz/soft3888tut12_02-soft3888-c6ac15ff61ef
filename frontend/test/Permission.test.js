import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PermissionsPage from '../app/permissions/page';
import { act } from 'react';

// Mock window.matchMedia
window.matchMedia = jest.fn(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
);

// Mock data
const mockUsers = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', profile: 'Admin' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', profile: 'User' },
];

const mockPermissionNodes = {
  user: ['create', 'read', 'update', 'delete'],
  post: ['create', 'read', 'update', 'delete'],
};

describe('PermissionsPage', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );
  });

  it('renders the user list correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsers, meta: { currentPage: 1, lastPage: 1 } }),
    });

    await act(async () => {
      render(<PermissionsPage />);
    });

    expect(screen.getByText('User Permissions')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('allows searching for users', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsers, meta: { currentPage: 1, lastPage: 1 } }),
    });

    await act(async () => {
      render(<PermissionsPage />);
    });

    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Mock the search API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockUsers[0]], meta: { currentPage: 1, lastPage: 1 } }),
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('displays user permissions when a user is selected', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsers, meta: { currentPage: 1, lastPage: 1 } }),
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });

    await act(async () => {
      render(<PermissionsPage />);
    });

    const userButton = screen.getByText('John Doe');
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ['user.create', 'user.read'],
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ['user.create', 'user.read', 'post.read'],
    });

    await act(async () => {
      fireEvent.click(userButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Permissions for John Doe')).toBeInTheDocument();
      expect(screen.getByText('user Permissions')).toBeInTheDocument();
      expect(screen.getByText('post Permissions')).toBeInTheDocument();
    });
  });

  it('allows toggling permissions for a user', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsers, meta: { currentPage: 1, lastPage: 1 } }),
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });

    await act(async () => {
      render(<PermissionsPage />);
    });

    const userButton = screen.getByText('John Doe');
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ['user.create', 'user.read'],
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ['user.create', 'user.read', 'post.read'],
    });

    await act(async () => {
      fireEvent.click(userButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Permissions for John Doe')).toBeInTheDocument();
    });

    const userPermissionsButton = screen.getByText('user Permissions');
    fireEvent.click(userPermissionsButton);

    const createPermissionCheckbox = screen.getByLabelText('create');
    fireEvent.click(createPermissionCheckbox);

    const saveButton = screen.getByText('Save Changes');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Permissions updated successfully' }),
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
  });

  it('handles error when fetching users', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch users'));

    await act(async () => {
      render(<PermissionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('handles error when fetching permission nodes', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsers, meta: { currentPage: 1, lastPage: 1 } }),
    });
    fetch.mockRejectedValueOnce(new Error('Failed to fetch permission nodes'));

    await act(async () => {
      render(<PermissionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    const mockPaginatedUsers = {
      data: [mockUsers[0]],
      meta: {
        total: 2,
        perPage: 1,
        currentPage: 1,
        lastPage: 2,
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPaginatedUsers,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });

    await act(async () => {
      render(<PermissionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Mock the next page API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockUsers[1]],
        meta: { ...mockPaginatedUsers.meta, currentPage: 2 },
      }),
    });

    fireEvent.click(screen.getByTestId('NavigateNextIcon').closest('button'));

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getAllByText('2').length).toBe(2);
    });
  });

  it('handles error when saving user permissions', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsers, meta: { currentPage: 1, lastPage: 1 } }),
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });

    await act(async () => {
      render(<PermissionsPage />);
    });

    const userButton = screen.getByText('John Doe');
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ['user.create', 'user.read'],
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ['user.create', 'user.read', 'post.read'],
    });

    await act(async () => {
      fireEvent.click(userButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Permissions for John Doe')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');

    fetch.mockRejectedValueOnce(new Error('Failed to save permissions'));

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save permissions. Please try again.')).toBeInTheDocument();
    });
  });

  it('resets all permissions for a user', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsers, meta: { currentPage: 1, lastPage: 1 } }),
    });

    await act(async () => {
      render(<PermissionsPage />);
    });

    const userButton = screen.getByText('John Doe');
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ['user.create', 'user.read'],
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ['user.create', 'user.read', 'post.read'],
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });

    await act(async () => {
      fireEvent.click(userButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Permissions for John Doe')).toBeInTheDocument();
    });

    const resetButton = screen.getByText('Reset All');
    fireEvent.click(resetButton);

    const saveButton = screen.getByText('Save Changes');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Permissions updated successfully' }),
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Permissions saved successfully.')).toBeInTheDocument();
    });
  });
});
