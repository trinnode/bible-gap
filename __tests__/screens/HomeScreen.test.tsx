import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate };

jest.mock('../../src/hooks/useAppFonts', () => ({
  useAppFonts: jest.fn(() => [true, null]),
}));

jest.mock('../../src/services/update', () => ({
  checkForUpdate: jest.fn(async () => null),
}));

jest.mock('../../src/services/db', () => ({
  initDB: jest.fn(async () => {}),
  getRandomVerses: jest.fn(async () => []),
  warmUpVerses: jest.fn(async () => {}),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', async () => {
    const { getByText } = await render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('Bible Gap')).toBeTruthy();
  });

  it('renders the subtitle', async () => {
    const { getByText } = await render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('Fill in the gaps to complete the verse')).toBeTruthy();
  });

  it('renders the Play button', async () => {
    const { getByText } = await render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('Play')).toBeTruthy();
  });

  it('navigates to Game screen when Play is pressed', async () => {
    const { getByText } = await render(<HomeScreen navigation={mockNavigation} />);
    await fireEvent.press(getByText('Play'));
    expect(mockNavigate).toHaveBeenCalledWith('Game');
  });

  it('does NOT render a Leaderboard button', async () => {
    const { queryByText } = await render(<HomeScreen navigation={mockNavigation} />);
    expect(queryByText('Leaderboard')).toBeNull();
  });

  it('initializes the database on mount', async () => {
    const { initDB } = require('../../src/services/db');
    await render(<HomeScreen navigation={mockNavigation} />);
    expect(initDB).toHaveBeenCalledTimes(1);
  });

  it('checks for updates on mount', async () => {
    const { checkForUpdate } = require('../../src/services/update');
    await render(<HomeScreen navigation={mockNavigation} />);
    expect(checkForUpdate).toHaveBeenCalledTimes(1);
  });

  it('renders loading state when fonts are not loaded', async () => {
    const { useAppFonts } = require('../../src/hooks/useAppFonts');
    useAppFonts.mockReturnValueOnce([false, null]);
    const { getByText } = await render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('Loading Bible Gap...')).toBeTruthy();
  });
});
