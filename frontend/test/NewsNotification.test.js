import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewsNotificationManagementPage from '../app/news_notifications/page';
import ManageSubscribedChannels from '../app/news_notifications/subscribed_news_channels/page';
import '@testing-library/jest-dom';

// Mock data
let mockNewsData = [];
let mockNotificationsData = [];
let mockSchoolsData = [];

describe('NewsNotificationManagementPage', () => {
  beforeAll(() => {
    global.matchMedia = global.matchMedia || function () {
      return {
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    };

    global.fetch = jest.fn((url, options = {}) => {
      if (url.includes('/news') && (!options.method || options.method === 'GET')) {
        // GET /news
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockNewsData }),
        });
      } else if (url.includes('/schools') && (!options.method || options.method === 'GET')) {
        // GET /schools
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockSchoolsData }),
        });
      } else if (url.includes('/notifications') && (!options.method || options.method === 'GET')) {
        // GET /notifications
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockNotificationsData }),
        });
      } else if (url.includes('/news') && options.method === 'POST') {
        // POST /news
        const newNewsData = JSON.parse(options.body);
        const newNews = {
          id: String(newNewsData.length + 1),
          ...newNewsData,
        };
        // Handle school assignment
        if (newNews.schools && newNews.schools.length > 0) {
          newNews.schools = newNews.schools.map(schoolId => {
            return mockSchoolsData.find(school => school.id === String(schoolId)) || null;
          }).filter(school => school !== null);
        }
        mockNewsData.push(newNews);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(newNews),
        });
      } else if (url.includes('/notifications') && options.method === 'POST') {
        // POST /notificaitons
        const newNotificationData = JSON.parse(options.body);
        const newNotification = {
          id: String(newNotificationData.length + 1),
          ...newNotificationData,
        };
        // Handle school assignment
        if (newNotification.schools && newNotification.schools.length > 0) {
          newNotification.schools = newNotification.schools.map(schoolId => {
            return mockSchoolsData.find(school => school.id === String(schoolId)) || null;
          }).filter(school => school !== null);
        }
        mockNotificationsData.push(newNotification);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(newNotification),
        });
      } else if (url.match(/\/news\/\d+$/) && options.method === 'PUT') {
        // PUT /news/:id
        const idToUpdate = url.split('/').pop();
        const updatedNewsData = JSON.parse(options.body);

        const index = mockNewsData.findIndex(news => news.id === idToUpdate);
        if (index !== -1) {
          const existingNews = mockNewsData[index];
          const updatedNews = { ...existingNews, ...updatedNewsData };

          if (updatedNews.schools && updatedNews.schools.length > 0) {
            updatedNews.schools = updatedNews.schools.map(schoolId => {
              return mockSchoolsData.find(school => school.id === String(schoolId)) || null;
            }).filter(school => school !== null);
          }

          mockNewsData[index] = updatedNews;

          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(updatedNews),
          });
        } else {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'News not found' }),
          });
        }
      } else if (url.match(/\/notifications\/\d+$/) && options.method === 'PUT') {
        // PUT /news/:id
        const idToUpdate = url.split('/').pop();
        const updatedNotificationData = JSON.parse(options.body);

        const index = mockNotificationsData.findIndex(notification => notification.id === idToUpdate);
        if (index !== -1) {
          const existingNotification = mockNotificationsData[index];
          const updatedNotification = { ...existingNotification, ...updatedNotificationData };

          if (updatedNotification.schools && updatedNotification.schools.length > 0) {
            updatedNotification.schools = updatedNotification.schools.map(schoolId => {
              return mockSchoolsData.find(school => school.id === String(schoolId)) || null;
            }).filter(school => school !== null);
          }

          mockNotificationsData[index] = updatedNotification;

          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(updatedNotification),
          });
        } else {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'Notifications not found' }),
          });
        }
      } else if (url.match(/\/news\/\d+$/) && options.method === 'DELETE') {
        // DELETE /news/:id
        const idToDelete = url.split('/').pop();
        const initialLength = mockNewsData.length;
        mockNewsData = mockNewsData.filter(news => news.id !== idToDelete);

        if (mockNewsData.length < initialLength) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'News deleted' }),
          });
        } else {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'News not found' }),
          });
        }
      } else if (url.match(/\/notifications\/\d+$/) && options.method === 'DELETE') {
        // DELETE /notification/:id
        const idToDelete = url.split('/').pop();
        const initialLength = mockNotificationsData.length;
        mockNotificationsData = mockNotificationsData.filter(notification => notification.id !== idToDelete);

        if (mockNotificationsData.length < initialLength) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Notification deleted' }),
          });
        } else {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'Notifications not found' }),
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
    mockNewsData = [
      { id: '1', title: 'Sample News', url: 'http://example.com', date: '2024-01-01', schools: [] },
    ];
    mockNotificationsData = [
      { id: '1', title: 'Sample Notification', content: 'This is a notification.', date: '2024-01-01', schools: [] },
    ];
    mockSchoolsData = [
      { id: '1', name: 'Test School' },
    ];
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  test('renders the NewsNotificationManagementPage and checks for basic elements', async () => {
    render(<NewsNotificationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('News and Notification Management')).toBeInTheDocument();
    });
    expect(screen.getByText(/Create News/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Notification/i)).toBeInTheDocument();
  });

  test('opens and closes the news modal', async () => {
    render(<NewsNotificationManagementPage />);
    
    fireEvent.click(screen.getByText(/Create News/i));
    expect(screen.getByPlaceholderText(/Enter title/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/✖️/i));
    expect(screen.queryByPlaceholderText(/Enter title/i)).not.toBeInTheDocument();
  });

  test('adds a news', async () => {
    render(<NewsNotificationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('News and Notification Management')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Sample News/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create News'));

    fireEvent.change(screen.getByPlaceholderText('Enter title'), { target: { value: 'New News' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('Enter URL'), { target: { value: 'http://news.com' } });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText(/New News/i)).toBeInTheDocument();
    });
  });

  test('edits a news', async () => {
    render(<NewsNotificationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('Sample News'))).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('✏️')[0]);
    fireEvent.change(screen.getByPlaceholderText('Enter title'), { target: { value: 'Updated News' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Updated News'))).toBeInTheDocument();
    });
  });

  test('deletes a news', async () => {
    render(<NewsNotificationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Sample News'))).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('❌')[0]);

    await waitFor(() => {
      expect(screen.queryByText((content) => content.includes('Sample News'))).not.toBeInTheDocument();
    });
  });

  test('opens and closes the notification modal', async () => {
    render(<NewsNotificationManagementPage />);

    fireEvent.click(screen.getByText(/Create Notification/i));
    expect(screen.getByPlaceholderText(/Enter title/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/✖️/i));
    expect(screen.queryByPlaceholderText(/Enter title/i)).not.toBeInTheDocument();
  });

  test('adds a new notification', async () => {
    render(<NewsNotificationManagementPage />);
    
    fireEvent.click(screen.getByText(/Create Notification/i));

    fireEvent.change(screen.getByPlaceholderText(/Enter title/i), { target: { value: 'Test Notification' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter content/i), { target: { value: 'This is a test notification content.' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });

    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      expect(screen.getByText(/Test Notification/i)).toBeInTheDocument();
    });
  });

  test('edits a notification', async () => {
    render(<NewsNotificationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('Sample Notification'))).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('✏️')[1]);
    fireEvent.change(screen.getByPlaceholderText('Enter title'), { target: { value: 'Updated Notification' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Updated Notification'))).toBeInTheDocument();
    });
  });

  test('deletes a notification', async () => {
    render(<NewsNotificationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Sample Notification'))).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('❌')[1]);

    await waitFor(() => {
      expect(screen.queryByText((content) => content.includes('Sample Notification'))).not.toBeInTheDocument();
    });
  });

  test('filters news based on search input', async () => {
    render(<NewsNotificationManagementPage />);

      // Wait for initial elements to render
      await waitFor(() => {
          expect(screen.getByText(/Sample News/i)).toBeInTheDocument();
      });

    fireEvent.change(screen.getByPlaceholderText(/Search News by title/i), { target: { value: 'Sample News' } });
    fireEvent.click(screen.getAllByText('Search')[0]);


    await waitFor(() => {
      expect(screen.getByText(/Sample News/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Search News by title/i), { target: { value: 'Nonexistent' } });
    fireEvent.click(screen.getAllByText('Search')[0]);

    await waitFor(() => {
      expect(screen.queryByText(/Sample News/i)).not.toBeInTheDocument();
    });
  });

  test('filters notifications based on search input', async () => {
    render(<NewsNotificationManagementPage />);

      // Wait for initial elements to render
      await waitFor(() => {
          expect(screen.getByText(/Sample Notification/i)).toBeInTheDocument();
      });

    fireEvent.change(screen.getByPlaceholderText(/Search Notification by title or content.../i), { target: { value: 'Sample Notification' } });
    fireEvent.click(screen.getAllByText('Search')[1]);

    await waitFor(() => {
      expect(screen.getByText(/Sample Notification/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Search Notification by title or content.../i), { target: { value: 'Nonexistent' } });
    fireEvent.click(screen.getAllByText('Search')[1]);

    await waitFor(() => {
      expect(screen.queryByText(/Sample Notification/i)).not.toBeInTheDocument();
    });
  });
});

test('shows no news and notifications when there are none', async () => {
  mockNewsData = [];
  mockNotificationsData = [];

  render(<NewsNotificationManagementPage />);

  await waitFor(() => {
    expect(screen.queryByText(/Sample News/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sample Notification/i)).not.toBeInTheDocument();
  });
});

test('click manage subscribed news channels button', async () => {
  render(<NewsNotificationManagementPage />);
  fireEvent.click(screen.getAllByText('Manage Subscribed News Channels')[0]);
  render(<ManageSubscribedChannels />);
});