import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

jest.mock('@expo-google-fonts/inter', () => ({
  useFonts: jest.fn(() => [true]),
  Inter_400Regular: 'Inter_400Regular',
}));

jest.mock('../src/services/update', () => ({
  checkForUpdate: jest.fn(async () => null),
}));

jest.mock('../src/services/db', () => ({
  initDB: jest.fn(async () => {}),
  getRandomVerses: jest.fn(async () => []),
}));

jest.mock('../src/services/notifications', () => ({
  requestNotificationPermissions: jest.fn(async () => 'granted'),
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { toJSON } = await render(<App />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows Home screen with title', async () => {
    const { getByText } = await render(<App />);
    expect(getByText('Bible Gap')).toBeTruthy();
  });

  it('shows subtitle', async () => {
    const { getByText } = await render(<App />);
    expect(getByText('Fill in the gaps to complete the verse')).toBeTruthy();
  });

  it('shows Play button', async () => {
    const { getByText } = await render(<App />);
    expect(getByText('Play')).toBeTruthy();
  });

  it('requests notification permissions on mount', async () => {
    const { requestNotificationPermissions } = require('../src/services/notifications');
    await render(<App />);
    expect(requestNotificationPermissions).toHaveBeenCalled();
  });

  it('initializes the database on mount', async () => {
    const { initDB } = require('../src/services/db');
    await render(<App />);
    expect(initDB).toHaveBeenCalled();
  });
});
