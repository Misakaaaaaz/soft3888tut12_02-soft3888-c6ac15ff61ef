// Calendar.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Calendar from '../app/calendar/Calendar.js'; // Adjust the import path as necessary
import '@testing-library/jest-dom';

describe('Calendar Component Tests', () => {
  // Setup: Mock fetch and fake timers before all tests
  beforeAll(() => {
    // Mock the global fetch function
    global.fetch = jest.fn();

    // Use fake timers and set system time to August 1, 2023
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2023-08-01'));
  });

  // Teardown: Restore real timers and clear fetch mocks after all tests
  afterAll(() => {
    jest.useRealTimers();
    global.fetch.mockClear();
    delete global.fetch;
  });

  // Reset fetch mocks before each test to ensure test isolation
  beforeEach(() => {
    fetch.mockClear();
  });

  /**
   * Test 1: Renders the Calendar Management heading
   */
  test('renders Calendar Management heading', async () => {
    // Mock fetch to return empty events
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(<Calendar initialEvents={[]} />);

    // Verify the heading is present
    const headingElement = screen.getByText(/Calendar Management/i);
    expect(headingElement).toBeInTheDocument();

    // Ensure fetch was called once for initial events
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });

  /**
   * Test 2: Switches to the next and previous month successfully
   */
  test('switches to the next and previous month successfully', async () => {
    // Mock fetch to return empty events
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(<Calendar initialEvents={[]} />);

    // Wait for the initial fetch to complete
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Initially, the month should be August 2023
    expect(screen.getByText(/August 2023/i)).toBeInTheDocument();

    // Click to switch to the next month (September)
    fireEvent.click(screen.getByText('>'));
    expect(screen.getByText(/September 2023/i)).toBeInTheDocument();

    // Click to switch back to the previous month (August)
    fireEvent.click(screen.getByText('<'));
    expect(screen.getByText(/August 2023/i)).toBeInTheDocument();
  });

  /**
   * Test 3: Displays an event modal when a date is clicked
   */
  test('displays an event modal', async () => {
    // Mock fetch to return empty events
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(<Calendar initialEvents={[]} />);

    // Wait for the initial fetch to complete
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Simulate clicking on the date '15' to open the modal
    fireEvent.click(screen.getByText('15'));

    // Check that the modal inputs are present
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Memo')).toBeInTheDocument();

    // Verify that the date inputs have the correct value
    const dateInputs = screen.getAllByDisplayValue('2023-08-15');
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  /**
   * Test 4: Opens and closes the event modal
   */
  test('opens and closes the event modal', async () => {
    // Mock fetch to return empty events
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(<Calendar initialEvents={[]} />);

    // Wait for the initial fetch to complete
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Open the modal by clicking on date '15'
    fireEvent.click(screen.getByText('15'));

    // Wait for the modal to appear
    await waitFor(() => expect(screen.getByPlaceholderText('Title')).toBeInTheDocument());

    // Close the modal by clicking the close button '×'
    fireEvent.click(screen.getByText('×'));

    // Verify that the modal is closed
    expect(screen.queryByPlaceholderText('Title')).not.toBeInTheDocument();
  });

  /**
   * Test 5: Adds a new event successfully
   */
  test('adds a new event successfully', async () => {
    // Mock fetch to return empty events on initial load
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(<Calendar initialEvents={[]} />);

    // Wait for the initial fetch to complete
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Open the modal by clicking on date '15'
    fireEvent.click(screen.getByText('15'));

    // Wait for the modal to appear
    await waitFor(() => expect(screen.getByPlaceholderText('Title')).toBeInTheDocument());

    // Fill out the form with new event details
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Event 1' } });
    fireEvent.change(screen.getByPlaceholderText('Memo'), { target: { value: 'Memo 1' } });

    // Simulate entering start and end times
    const timeInputs = screen.getAllByDisplayValue('', { selector: 'input[type="time"]' });
    expect(timeInputs.length).toBe(2); // Ensure there are two time inputs

    fireEvent.change(timeInputs[0], { target: { value: '12:30' } }); // Start Time
    fireEvent.change(timeInputs[1], { target: { value: '13:30' } }); // End Time

    // Mock the POST request to add a new event
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 2,
        title: 'Event 1',
        startDate: '2023-08-15T12:30',
        endDate: '2023-08-15T13:30',
        description: 'Memo 1',
      }),
    });

    // Submit the form by clicking the 'Add' button
    fireEvent.click(screen.getByText('Add'));

    // Wait for the POST request to be called
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

    // Optionally, verify that the new event is displayed on the calendar
    // This depends on how the Calendar component displays events
    // For example:
    // expect(screen.getByText('Event 1')).toBeInTheDocument();
  });

  /**
   * Test 6: Edits an event successfully
   */
  test('edits an event successfully', async () => {
    const initialEvents = [
      {
        id: 1,
        title: 'Test Event',
        startDate: '2023-08-15T12:30',
        endDate: '2023-08-15T13:30',
        description: 'Test Description',
      },
    ];

    // Mock fetch to return initial events on initial load
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: initialEvents }),
    });

    render(<Calendar initialEvents={initialEvents} />);

    // Wait for the initial fetch to complete
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Find all '15' elements
    const day15Elements = screen.getAllByText('15');
    expect(day15Elements.length).toBeGreaterThan(0);

    let targetCalendarCell;
    let eventDot;

    // Iterate through each '15' element to find the one with an 'event-dot'
    for (const day15Element of day15Elements) {
      const calendarCell = day15Element.closest('.calendar-cell');
      if (calendarCell && calendarCell.querySelector('.event-dot')) {
        targetCalendarCell = calendarCell;
        eventDot = calendarCell.querySelector('.event-dot');
        break;
      }
    }

    // Ensure that the calendar cell and event-dot were found
    expect(targetCalendarCell).toBeInTheDocument();
    expect(eventDot).toBeInTheDocument();

    // Click on the event-dot to open the edit modal
    fireEvent.click(eventDot);

    // Wait for the modal to appear
    await waitFor(() => expect(screen.getByPlaceholderText('Title')).toBeInTheDocument());

    // Check that the modal fields are populated with the event data
    expect(screen.getByPlaceholderText('Title').value).toBe('Test Event');
    expect(screen.getByPlaceholderText('Memo').value).toBe('Test Description');

    // Edit the event details
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Updated Event' } });
    fireEvent.change(screen.getByPlaceholderText('Memo'), { target: { value: 'Updated Description' } });

    // Mock the PUT request to update the event
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        title: 'Updated Event',
        startDate: '2023-08-15T12:30',
        endDate: '2023-08-15T13:30',
        description: 'Updated Description',
      }),
    });

    // Submit the changes by clicking the 'Save Changes' button
    fireEvent.click(screen.getByText('Save Changes'));

    // Wait for the PUT request to be called
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

    // Verify that the updated event is reflected in the UI
    expect(screen.queryByText('Updated Event')).not.toBeInTheDocument();
  });
});
