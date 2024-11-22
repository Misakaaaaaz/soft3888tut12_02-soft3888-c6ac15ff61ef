import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock icons
jest.mock('@mui/icons-material/DarkModeRounded', () => ({ __esModule: true, default: () => <span>DarkModeIcon</span> }));
jest.mock('@mui/icons-material/LightModeRounded', () => ({ __esModule: true, default: () => <span>LightModeIcon</span> }));

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

// Mock the fetch function
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
);

// Mock the redirect function
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Import the component after all mocks are set up
import { login } from '../app/signin/login';
import { redirect } from 'next/navigation';
import JoySignInSideTemplate from '../app/signin/page';

describe('login function', () => {
  beforeAll(() => {
    window.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure fetch always returns a Promise
    fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );
  });

  test('successful login redirects to homepage', async () => {
    // Mock a successful fetch response
    global.fetch.mockResolvedValueOnce({
      ok: true,
    });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    await login({}, formData);

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3333/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    expect(redirect).toHaveBeenCalledWith('/homepage');
  });

  test('failed login returns error message', async () => {
    // Mock a failed fetch response
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    const formData = new FormData();
    formData.append('email', 'wrong@example.com');
    formData.append('password', 'wrongpassword');

    const result = await login({}, formData);

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3333/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      }),
    });

    expect(result).toEqual({
      success: false,
      message: 'Invalid email or password',
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  test('network error throws an exception', async () => {
    // Mock a network error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    await expect(login({}, formData)).rejects.toThrow('Network error');
  });
});

describe('JoySignInSideTemplate', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders signin form', () => {
    render(<JoySignInSideTemplate />);
    
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('allows user to enter email and password', () => {
    render(<JoySignInSideTemplate />);
    
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('renders footer with current year', () => {
    render(<JoySignInSideTemplate />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© OIC Education ${currentYear}`)).toBeInTheDocument();
  });

  test('renders "Remember me" checkbox', () => {
    render(<JoySignInSideTemplate />);
    
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  test('renders "Forgot your password?" link', () => {
    render(<JoySignInSideTemplate />);
    
    expect(screen.getByText(/forgot your password\?/i)).toBeInTheDocument();
  });

  test('renders OIC Education logo and title', () => {
    render(<JoySignInSideTemplate />);
    
    expect(screen.getByAltText('Language')).toBeInTheDocument();
    expect(screen.getByText('OIC Education')).toBeInTheDocument();
  });

  test('renders color scheme toggle button', () => {
    render(<JoySignInSideTemplate />);
    
    expect(screen.getByLabelText(/toggle light\/dark mode/i)).toBeInTheDocument();
  });

  test('toggles color scheme when clicking the toggle button', () => {
    render(<JoySignInSideTemplate />);
    
    const toggleButton = screen.getByLabelText(/toggle light\/dark mode/i);

    expect(screen.getByText('LightModeIcon')).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText('DarkModeIcon')).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText('LightModeIcon')).toBeInTheDocument();
  });

  test('renders "Remember me" checkbox unchecked by default', () => {
    render(<JoySignInSideTemplate />);
    
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  test('allows toggling of "Remember me" checkbox', () => {
    render(<JoySignInSideTemplate />);
    
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
    
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  test('renders correct heading and subheading', () => {
    render(<JoySignInSideTemplate />);
    
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test('renders password input as password type', () => {
    render(<JoySignInSideTemplate />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('renders "Forgot your password?" link with correct text', () => {
    render(<JoySignInSideTemplate />);
    
    const forgotPasswordLink = screen.getByText(/forgot your password\?/i);
    expect(forgotPasswordLink).toHaveAttribute('href', '#replace-with-a-link');
  });
});
