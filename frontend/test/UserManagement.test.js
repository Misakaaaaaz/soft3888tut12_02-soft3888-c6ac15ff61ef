// test/UserManagement.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserManagementPage from '../app/usermanagement/page'; // Adjust the import path as necessary

// Mock data
let mockUsersData = [];
let mockSchoolsData = [];

describe('UserManagementPage', () => {
  beforeAll(() => {
    global.matchMedia = global.matchMedia || function () {
      return {
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    };

    global.fetch = jest.fn((url, options = {}) => {
      if (url.includes('/users') && (!options.method || options.method === 'GET')) {
        // GET /users
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockUsersData }),
        });
      } else if (url.includes('/schools') && (!options.method || options.method === 'GET')) {
        // GET /schools
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockSchoolsData }),
        });
      } else if (url.includes('/users') && options.method === 'POST') {
        // POST /users
        const newUserData = JSON.parse(options.body);
        const newUser = {
          id: String(mockUsersData.length + 1),
          ...newUserData,
        };

        // Handle school assignment
        if (newUser.userSchoolId) {
          const school = mockSchoolsData.find(school => school.id === String(newUser.userSchoolId));
          if (school) {
            newUser.school = school;
          } else {
            newUser.school = null;
          }
        } else {
          newUser.school = null;
        }

        mockUsersData.push(newUser);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(newUser),
        });
      } else if (url.match(/\/users\/\d+$/) && options.method === 'PUT') {
        // PUT /users/:id
        const idToUpdate = url.split('/').pop();
        const updatedUserData = JSON.parse(options.body);

        // Find the user in mockUsersData
        const index = mockUsersData.findIndex(user => user.id === idToUpdate);
        if (index !== -1) {
          const existingUser = mockUsersData[index];
          const updatedUser = {
            ...existingUser,
            ...updatedUserData,
          };

          // Handle school assignment
          if (updatedUser.userSchoolId) {
            const school = mockSchoolsData.find(school => school.id === String(updatedUser.userSchoolId));
            if (school) {
              updatedUser.school = school;
            } else {
              updatedUser.school = null;
            }
          } else {
            updatedUser.school = null;
          }

          mockUsersData[index] = updatedUser;

          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(updatedUser),
          });
        } else {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'User not found' }),
          });
        }
      } else if (url.match(/\/users\/\d+$/) && options.method === 'DELETE') {
        // DELETE /users/:id
        const idToDelete = url.split('/').pop();
        const initialLength = mockUsersData.length;
        mockUsersData = mockUsersData.filter(user => user.id !== idToDelete);

        if (mockUsersData.length < initialLength) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'User deleted' }),
          });
        } else {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'User not found' }),
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
    }); // Close global.fetch

  });
    


  beforeEach(() => {
    // Reset mock data before each test
    mockUsersData = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        profile: 'Student',
        school: null,
        access: 'Low',
        relatedUsers: [],
      },
    ];

    mockSchoolsData = [
      {
        id: '1',
        name: 'Test School',
      },
    ];
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  test('adds a user', async () => {
    render(<UserManagementPage />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    // Wait for initial users to load
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    // Proceed with the rest of your test...
    // Click on "Create User" button
    fireEvent.click(screen.getByText('Create User'));

    // Fill in the user form
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });

    // Select Profile
    fireEvent.change(screen.getByLabelText('Profile'), { target: { value: 'Teacher' } });

    // Select School
    fireEvent.change(screen.getByLabelText('School'), { target: { value: '1' } }); // Assuming '1' is the ID of the school

    // Select Access
    fireEvent.change(screen.getByLabelText('Access'), { target: { value: 'Medium' } });

    // Submit the form
    fireEvent.click(screen.getByText('Submit'));

    // Wait for the new user to appear in the list
    await waitFor(() => {
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/jane@example.com/i)).toBeInTheDocument();
    });
  });


  test('edits a user', async () => {
    render(<UserManagementPage />);
  
    // Wait for initial data to load
    await waitFor(() => {
      // Use a function to match the text content
      expect(screen.getByText((content, element) => content.includes('John Doe'))).toBeInTheDocument();
    });
  
    // Click on the edit button for the first user
    fireEvent.click(screen.getAllByText('✏️')[0]);
  
    // Change the first name
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jonathan' } });
  
    // Submit the form
    fireEvent.click(screen.getByText('Submit'));
  
    // Wait for the user's name to update
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Jonathan Doe'))).toBeInTheDocument();
      expect(screen.queryByText((content) => content.includes('John Doe'))).not.toBeInTheDocument();
    });
  });
  
  test('deletes a user', async () => {
    render(<UserManagementPage />);
  
    // Wait for initial data to load
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('John Doe'))
      ).toBeInTheDocument();
    });
  
    // Click on the delete button for the first user
    fireEvent.click(screen.getAllByText('❌')[0]);
  
    // Wait for the user to be removed from the list
    await waitFor(() => {
      expect(
        screen.queryByText((content) => content.includes('John Doe'))
      ).not.toBeInTheDocument();
    });
  });
  

  test('filters users by search input', async () => {
    // Add multiple users to mock data
    mockUsersData.push(
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        profile: 'Teacher',
        school: null,
        access: 'Medium',
        relatedUsers: [],
      },
      {
        id: '3',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        profile: 'Parent',
        school: null,
        access: 'High',
        relatedUsers: [],
      }
    );
  
    render(<UserManagementPage />);
  
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('John Doe'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Jane Smith'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Alice Johnson'))).toBeInTheDocument();
    });
  
    // Enter search term
    await fireEvent.change(screen.getByPlaceholderText('Search by name...'), { target: { value: 'alice' } });
    fireEvent.click(screen.getAllByText('Search')[0]);
  
    // Verify that only Alice is displayed
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Alice Johnson'))).toBeInTheDocument();
      expect(screen.queryByText((content) => content.includes('John Doe'))).not.toBeInTheDocument();
      expect(screen.queryByText((content) => content.includes('Jane Smith'))).not.toBeInTheDocument();
    });
  });
  

    test('shows no users when there are none', async () => {
      // Clear mock users data
      mockUsersData = [];
    
      render(<UserManagementPage />);
    
      // Wait for the component to render
      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument();
      });
    });

    test('displays multiple users', async () => {
      // Override mockUsersData for this test
      mockUsersData = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          profile: 'Student',
          school: null,
          access: 'Low',
          relatedUsers: [],
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          profile: 'Teacher',
          school: null,
          access: 'Medium',
          relatedUsers: [],
        },
        {
          id: '3',
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice@example.com',
          profile: 'Parent',
          school: null,
          access: 'High',
          relatedUsers: [],
        },
      ];
    
      render(<UserManagementPage />);
    
      // Wait for initial data to load
      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('John Doe'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Jane Smith'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Alice Johnson'))).toBeInTheDocument();
      });
    });
      
});
  