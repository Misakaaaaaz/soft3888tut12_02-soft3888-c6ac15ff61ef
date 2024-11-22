// test/School.test.js

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false, // You can set this to true if needed
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

// Mock `global.fetch` before importing the component
let mockSchoolsData = [];
let mockUsersData = [];

global.fetch = jest.fn((url, options = {}) => {
  // Handle different endpoints and methods
  if (url.endsWith('/schools') && (!options.method || options.method === 'GET')) {
    // GET /schools
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: mockSchoolsData }),
    });
  } else if (url.endsWith('/users') && (!options.method || options.method === 'GET')) {
    // GET /users
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: mockUsersData }),
    });
  } else if (url.endsWith('/schools') && options.method === 'POST') {
    // POST /schools
    const newSchoolData = JSON.parse(options.body);
    const newSchool = {
      id: String(mockSchoolsData.length + 1),
      ...newSchoolData,
      adminUser: mockUsersData.find((user) => user.id === newSchoolData.adminUserId) || null,
    };
    mockSchoolsData.push(newSchool);
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(newSchool),
    });
  } else if (url.match(/\/schools\/\d+$/) && options.method === 'PUT') {
    // PUT /schools/:id
    const id = url.split('/').pop();
    const updatedSchoolData = JSON.parse(options.body);
    const index = mockSchoolsData.findIndex((school) => school.id === id);
    if (index !== -1) {
      const updatedSchool = {
        ...mockSchoolsData[index],
        ...updatedSchoolData,
        adminUser: mockUsersData.find((user) => user.id === updatedSchoolData.adminUserId) || null,
      };
      mockSchoolsData[index] = updatedSchool;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(updatedSchool),
      });
    } else {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'School not found' }),
      });
    }
  } else if (url.match(/\/schools\/\d+$/) && options.method === 'DELETE') {
    // DELETE /schools/:id
    const id = url.split('/').pop();
    const index = mockSchoolsData.findIndex((school) => school.id === id);
    if (index !== -1) {
      mockSchoolsData.splice(index, 1);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'School deleted' }),
      });
    } else {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'School not found' }),
      });
    }
  } else {
    // Default response for unhandled requests
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not Found' }),
    });
  }
});

// Import the component after setting up the fetch mock
import SchoolManagementPage from '../app/school/page';

describe('SchoolManagementPage', () => {
  beforeEach(() => {
    // Initialize mock data before each test
    mockUsersData = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
    ];

    mockSchoolsData = [
      { id: '1', name: 'Test School', adminUserId: '1', adminUser: null },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('edits a school to change its name', async () => {
    render(<SchoolManagementPage />);

    // Wait for "Test School" to be in the document
    await waitFor(() => {
      expect(screen.getByText('Test School')).toBeInTheDocument();
    });

    // Click the edit button associated with "Test School"
    const editButtons = screen.getAllByText('✏️');
    fireEvent.click(editButtons[0]);

    // Wait for the modal to open
    await waitFor(() => {
      expect(screen.getByPlaceholderText('School Name')).toBeInTheDocument();
    });

    // Change the school name
    fireEvent.change(screen.getByPlaceholderText('School Name'), {
      target: { value: 'Edited School Name' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Submit'));

    // Wait for the school list to update
    await waitFor(() => {
      expect(screen.getByText('Edited School Name')).toBeInTheDocument();
      expect(screen.queryByText('Test School')).not.toBeInTheDocument();
    });
  });

  test('shows no schools when there are none', async () => {
    // Set mockSchoolsData to empty array
    mockSchoolsData = [];

    render(<SchoolManagementPage />);

    // Wait for schools to load (which will be none)
    await waitFor(() => {
      expect(screen.getByText('No schools found')).toBeInTheDocument();
    });
  });

  test('displays multiple schools in the list', async () => {
    // Set mockSchoolsData to have multiple schools
    mockSchoolsData = [
      { id: '1', name: 'Test School 1', adminUserId: '1', adminUser: null },
      { id: '2', name: 'Test School 2', adminUserId: '2', adminUser: null },
      { id: '3', name: 'Test School 3', adminUserId: null, adminUser: null },
    ];

    render(<SchoolManagementPage />);

    // Wait for schools to load
    await waitFor(() => {
      expect(screen.getByText('Test School 1')).toBeInTheDocument();
      expect(screen.getByText('Test School 2')).toBeInTheDocument();
      expect(screen.getByText('Test School 3')).toBeInTheDocument();
    });
  });

  test('adds a school with an admin user assigned', async () => {
    render(<SchoolManagementPage />);

    // Wait for the initial schools to load
    await waitFor(() => {
      expect(screen.getByText('Test School')).toBeInTheDocument();
    });

    // Click the "Create School" button
    fireEvent.click(screen.getByText('Create School'));

    // Wait for the modal to open
    await waitFor(() => {
      expect(screen.getByPlaceholderText('School Name')).toBeInTheDocument();
    });

    // Fill in the school name
    fireEvent.change(screen.getByPlaceholderText('School Name'), {
      target: { value: 'School with Admin' },
    });

    // Select an admin user from the dropdown
    fireEvent.change(screen.getByLabelText('Admin User'), {
      target: { value: '2' }, // Selecting Jane Smith
    });

    // Submit the form
    fireEvent.click(screen.getByText('Submit'));

    // Wait for the new school to appear in the list
    await waitFor(() => {
      expect(screen.getByText('School with Admin')).toBeInTheDocument();
    });

    // Verify that the admin user's name is displayed
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('adds a school', async () => {
    render(<SchoolManagementPage />);

    // Wait for the initial schools to load
    await waitFor(() => {
      expect(screen.getByText('Test School')).toBeInTheDocument();
    });

    // Click the "Create School" button
    fireEvent.click(screen.getByText('Create School'));

    // Fill in the school name
    fireEvent.change(screen.getByPlaceholderText('School Name'), {
      target: { value: 'New Test School' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Submit'));

    // Wait for the new school to appear in the list
    await waitFor(() => {
      expect(screen.getByText('New Test School')).toBeInTheDocument();
    });
  });

  test('deletes a school', async () => {
    render(<SchoolManagementPage />);

    // Wait for "Test School" to be in the document
    await waitFor(() => {
      expect(screen.getByText('Test School')).toBeInTheDocument();
    });

    // Click the delete button associated with "Test School"
    fireEvent.click(screen.getAllByText('❌')[0]);

    // Wait for the "Test School" to be removed from the document
    await waitFor(() => {
      expect(screen.queryByText('Test School')).not.toBeInTheDocument();
    });
  });

  test('renders the SchoolManagementPage with basic elements', async () => {
    render(<SchoolManagementPage />);

    expect(screen.getByText(/School Management/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Test School/i)).toBeInTheDocument());
  });

  test('opens and closes the school modal', async () => {
    render(<SchoolManagementPage />);

    fireEvent.click(screen.getByText(/Create School/i));
    expect(screen.getByPlaceholderText(/School Name/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/✖️/i));
    expect(screen.queryByPlaceholderText(/School Name/i)).not.toBeInTheDocument();
  });

  test('filters schools by search input', async () => {
    render(<SchoolManagementPage />);

    // Wait for schools to be rendered
    await waitFor(() => expect(screen.getByText(/Test School/i)).toBeInTheDocument());

    // Perform search
    // fireEvent.change(screen.getByPlaceholderText(/Search schools/i), {
    //   target: { value: 'Nonexistent' },
    // });
    await fireEvent.change(screen.getByPlaceholderText('Search schools...'), { target: { value: 'Nonexistent' } });
    fireEvent.click(screen.getAllByText('Search')[0]);

    // Verify that no schools match the search term
    expect(screen.queryByText(/Test School/i)).not.toBeInTheDocument();
  });
});
