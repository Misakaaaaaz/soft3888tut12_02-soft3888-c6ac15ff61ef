import React, { act } from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import DailyMoodPage from '../app/Daily_mood/page'; 
import '@testing-library/jest-dom';


beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: [] })  
    })
  );


  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: function () { },
      removeListener: function () { }
    };
  };
});

test('renders the DailyMoodPage and checks for basic elements', () => {
  render(<DailyMoodPage />);


  expect(screen.getByText(/Mood Types/i)).toBeInTheDocument();
  expect(screen.getByText(/SOS Notifications/i)).toBeInTheDocument();


  expect(screen.getByText(/Add Mood/i)).toBeInTheDocument();
  expect(screen.getByText(/Add SOS Notification/i)).toBeInTheDocument();
});

test('opens and closes the Add Mood modal', () => {
  render(<DailyMoodPage />);


  fireEvent.click(screen.getByText(/Add Mood/i));
  expect(screen.getByLabelText(/Mood Name/i)).toBeInTheDocument();


  fireEvent.click(screen.getByText(/✖️/i));
  expect(screen.queryByPlaceholderText(/Enter mood/i)).not.toBeInTheDocument();
});

test('adds a new mood entry', async () => {
  render(<DailyMoodPage />);


  fireEvent.click(screen.getByText(/Add Mood/i));


  fireEvent.change(screen.getByLabelText(/Mood Name/i), { target: { value: 'Happy' } });
  fireEvent.change(screen.getByLabelText(/Mood Image URL/i), { target: { value: 'https://example.com/happy.png' } });

  
  fireEvent.click(screen.getByText(/Submit/i));


  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:3333/moods',
    expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Happy', imageUrl: 'https://example.com/happy.png' }),
    })
  );
});

test('filters moods based on search input', async () => {
  const mockMoods = [
    { id: 1, name: 'Happy', image: 'https://example.com/happy.png' },
    { id: 2, name: 'Sad', image: 'https://example.com/sad.png' },
  ];

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockMoods }),
  });

  render(<DailyMoodPage />);

  const searchInput = screen.getByPlaceholderText('Search Moods');
  fireEvent.change(searchInput, { target: { value: 'Happy' } });

  await waitFor(() => {
    expect(screen.getByText('Happy')).toBeInTheDocument();
    expect(screen.queryByText('Sad')).not.toBeInTheDocument();
  });
});

test('deletes a mood', async () => {
  const mockMoods = [
    { id: 1, name: 'Happy', image: 'https://example.com/happy.png' },
  ];

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockMoods }),
  });

  await act(() => {
    render(<DailyMoodPage />);
  });


  const deleteButton = screen.getByTestId('mood-delete'); 

 
  window.confirm = jest.fn(() => true);


  fireEvent.click(deleteButton);

  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:3333/moods/1',
    expect.objectContaining({
      method: 'DELETE',
    })
  );


  await waitFor(() => {
    expect(screen.queryByText('Happy')).not.toBeInTheDocument();
  });
});


test('opens and closes the Add SOS Notification modal', () => {
  render(<DailyMoodPage />);


  fireEvent.click(screen.getByText(/Add SOS Notification/i));
  expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();


  fireEvent.click(screen.getByText(/✖️/i));
  expect(screen.queryByPlaceholderText(/Enter name/i)).not.toBeInTheDocument();
});


test('filters SOS notifications based on search input', async () => {
  const mockMoods = [
    { id: 1, name: 'Happy', image: 'https://example.com/happy.png' },
    { id: 2, name: 'Sad', image: 'https://example.com/sad.png' },
  ];

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockMoods }),
  });

  const mockSOSNotifications = [
    { id: 1, name: 'John Doe', email: 'john@example.com', contact: '123456', batch: 'Batch-1' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', contact: '654321', batch: 'Batch-2' },
  ];

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockSOSNotifications }),
  });

  render(<DailyMoodPage />);

  const searchInput = screen.getByPlaceholderText('Search SOS Notifications (name or batch)');
  fireEvent.change(searchInput, { target: { value: 'John' } });

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });
});

test('deletes an SOS notification', async () => {
  const mockMoods = [
    { id: 1, name: 'Happy', image: 'https://example.com/happy.png' },
    { id: 2, name: 'Sad', image: 'https://example.com/sad.png' },
  ];

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockMoods }),
  });

  const mockSOSNotifications = [
    { id: 1, name: 'John Doe', email: 'john@example.com', contact: '123456', batch: 'Batch-1' },
  ];

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockSOSNotifications }),
  });

  await act(() => {
    render(<DailyMoodPage />);
  })

  const deleteButton = screen.getByTestId('sos-delete')

  window.confirm = jest.fn(() => true);

  fireEvent.click(deleteButton);


  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:3333/sos_messages/1',
    expect.objectContaining({
      method: 'DELETE',
    })
  );

 
  await waitFor(() => {
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});

test('updates an existing mood entry', async () => {
  const mockMoods = [
    { id: 1, name: 'Happy', image: 'https://example.com/happy.png' },
  ];

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockMoods }),
  });

  await act(async () => {
    render(<DailyMoodPage />);
  });

  const editButton = screen.getByTestId('mood-edit'); 
  fireEvent.click(editButton);


  expect(screen.getByLabelText(/Mood Name/i)).toHaveValue('Happy');
  expect(screen.getByLabelText(/Mood Image URL/i)).toHaveValue('https://example.com/happy.png');


  fireEvent.change(screen.getByLabelText(/Mood Name/i), { target: { value: 'Excited' } });
  fireEvent.change(screen.getByLabelText(/Mood Image URL/i), { target: { value: 'https://example.com/excited.png' } });


  fireEvent.click(screen.getByText(/Submit/i));


  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:3333/moods/1', 
    expect.objectContaining({
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Excited', imageUrl: 'https://example.com/excited.png' }),
    })
  );
});

test('updates an existing SOS notification entry', async () => {
  const mockMoods = [
    { id: 1, name: 'Happy', image: 'https://example.com/happy.png' },
  ];

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockMoods }),
  });
  const mockSOSNotifications = [
    { id: 1, name: 'John Doe', email: 'john@example.com', contact: '123456', batch: 'Batch-1', school: 'ABC School', alertDate: '2024-10-01' },
  ];

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: mockSOSNotifications }),
  });

  await act(async () => {
    render(<DailyMoodPage />);
  });

  const editButton = screen.getByTestId('sos-edit'); 
  fireEvent.click(editButton);


  expect(screen.getByLabelText(/Name/i)).toHaveValue('John Doe');
  expect(screen.getByLabelText(/Email/i)).toHaveValue('john@example.com');
  expect(screen.getByLabelText(/Contact/i)).toHaveValue('123456');
  expect(screen.getByLabelText(/Batch/i)).toHaveValue('Batch-1');
  expect(screen.getByLabelText(/School/i)).toHaveValue('ABC School');


  fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Doe' } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
  fireEvent.change(screen.getByLabelText(/Contact/i), { target: { value: '654321' } });

 
  fireEvent.click(screen.getByText(/Submit SOS Notification/i));

  await waitFor(() => {

    expect(global.fetch).toHaveBeenCalled();
  });
});
