import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GroupPermissionsPage from '../app/groups/page';
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
const mockGroups = {
  data: [
    { id: 1, name: 'Admin', permissions: ['user.create', 'user.read'] },
    { id: 2, name: 'Editor', permissions: ['post.create', 'post.read'] },
  ],
  meta: {
    total: 2,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  },
};

const mockPermissionNodes = {
  user: ['create', 'read', 'update', 'delete'],
  post: ['create', 'read', 'update', 'delete'],
};

describe('GroupPermissionsPage', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );
  });

  it('renders the group list correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    expect(screen.getByText('Group Permissions')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search groups...')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('allows searching for groups', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    const searchInput = screen.getByPlaceholderText('Search groups...');
    fireEvent.change(searchInput, { target: { value: 'Admin' } });

    // Mock the search API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockGroups.data[0]],
        meta: { ...mockGroups.meta, total: 1 }
      }),
    });

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.queryByText('Editor')).not.toBeInTheDocument();
    });
  });

  it('allows creating a new group', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    const newGroupButton = screen.getByText('New Group');
    fireEvent.click(newGroupButton);

    const newGroupInput = screen.getByPlaceholderText('New group name');
    fireEvent.change(newGroupInput, { target: { value: 'New Group' } });

    const createButton = screen.getByTestId('CheckIcon').parentElement;

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 3, name: 'New Group', permissions: [] }),
    });

    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('New Group')).toBeInTheDocument();
    });
  });

  it('allows editing a group', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        const group = mockGroups.data.find(group => group.id === 1);
        return {
          data: [group],
          meta: { ...mockGroups.meta, total: 1 }
        };
      }
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        const group = mockGroups.data.find(group => group.id === 1);
        return {
          data: [group],
          meta: { ...mockGroups.meta, total: 1 }
        };
      }
    });

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    const editButton = screen.getByTestId('EditIcon').parentElement;
    fireEvent.click(editButton);

    const editInput = screen.getByDisplayValue('Admin');
    fireEvent.change(editInput, { target: { value: 'Super Admin' } });

    const updateButton = screen.getByTestId('CheckIcon').parentElement;

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockGroups.data[0], name: 'Super Admin' }),
    });

    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('Super Admin')).toBeInTheDocument();
    });
  });

  it('allows deleting a group', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        const group = mockGroups.data.find(group => group.id === 1);
        return {
          data: [group],
          meta: { ...mockGroups.meta, total: 1 }
        };
      }
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        const group = mockGroups.data.find(group => group.id === 1);
        return {
          data: [group],
          meta: { ...mockGroups.meta, total: 1 }
        };
      }
    });

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    const deleteButton = screen.getByTestId('DeleteIcon').parentElement;

    // Mock the confirm dialog
    window.confirm = jest.fn(() => true);

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });

  it('displays group permissions when a group is selected', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    const groupButton = screen.getByText('Admin');
    
    await act(async () => {
      fireEvent.click(groupButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Permissions for Admin')).toBeInTheDocument();
      expect(screen.getByText('user Permissions')).toBeInTheDocument();
      expect(screen.getByText('post Permissions')).toBeInTheDocument();
    });
  });

  it('allows toggling permissions for a group', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    const groupButton = screen.getByText('Admin');
    
    await act(async () => {
      fireEvent.click(groupButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Permissions for Admin')).toBeInTheDocument();
    });

    const userPermissionsButton = screen.getByText('user Permissions');
    fireEvent.click(userPermissionsButton);

    const createPermissionCheckbox = screen.getByLabelText('create');
    fireEvent.click(createPermissionCheckbox);

    const saveButton = screen.getByText('Save Changes');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockGroups.data[0], permissions: ['user.create', 'user.read', 'user.update'] }),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockGroups.data[0], permissions: ['user.create', 'user.read', 'user.update'] }),
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
  });

  it('handles error when fetching groups', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch groups'));

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch groups')).toBeInTheDocument();
    });
  });

  it('handles error when fetching permission nodes', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });
    fetch.mockRejectedValueOnce(new Error('Failed to fetch permission nodes'));

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch permission data')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    const mockPaginatedGroups = {
      data: [
        { id: 1, name: 'Admin', permissions: ['user.create', 'user.read'] },
      ],
      meta: {
        total: 2,
        perPage: 1,
        currentPage: 1,
        lastPage: 2,
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPaginatedGroups,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPaginatedGroups,
    });

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      screen.queryAllByText('1').forEach(element => {
        expect(element).toBeInTheDocument();
      });
      screen.queryAllByText('2').forEach(element => {
        expect(element).toBeInTheDocument();
      });
    });

    // Mock the next page API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 2, name: 'Editor', permissions: ['post.create', 'post.read'] }],
        meta: { ...mockPaginatedGroups.meta, currentPage: 2 },
      }),
    });

    fireEvent.click(screen.getByTestId('NavigateNextIcon').closest('button')); // Click on the next page button

    await waitFor(() => {
      expect(screen.getByText('Editor')).toBeInTheDocument();
      expect(screen.getAllByText('2').length).toBe(2);
    });
  });

  it('handles error when saving group permissions', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    const groupButton = screen.getByText('Admin');
    await act(async () => {
      fireEvent.click(groupButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Permissions for Admin')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');

    fetch.mockRejectedValueOnce(new Error('Failed to save permissions'));

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save group permissions. Please try again.')).toBeInTheDocument();
    });
  });

  it('resets all permissions for a group', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPermissionNodes,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGroups,
    });

    await act(async () => {
      render(<GroupPermissionsPage />);
    });

    const groupButton = screen.getByText('Admin');
    await act(async () => {
      fireEvent.click(groupButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Permissions for Admin')).toBeInTheDocument();
    });

    const resetButton = screen.getByText('Reset All');
    fireEvent.click(resetButton);

    const saveButton = screen.getByText('Save Changes');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockGroups.data[0], permissions: [] }),
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Group permissions saved successfully.')).toBeInTheDocument();
    });
  });
});
