import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GameScreen from '../../src/screens/GameScreen';

const mockGoBack = jest.fn();
const mockNavigation = { goBack: mockGoBack };

jest.mock('@expo-google-fonts/inter', () => ({
  useFonts: jest.fn(() => [true]),
  Inter_400Regular: 'Inter_400Regular',
}));

jest.mock('../../src/services/db', () => ({
  initDB: jest.fn(async () => {}),
  getRandomVerses: jest.fn(async () => [
    {
      reference: 'John 3:16',
      text: 'For God so loved the world that he gave his one and only Son',
      version: 'KJV',
    },
  ]),
}));

describe('GameScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads verse and displays reference after mount', async () => {
    const { getByText } = await render(<GameScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText('John 3:16')).toBeTruthy();
    });
  });

  it('renders at least 4 gap placeholders', async () => {
    const { getAllByText } = await render(<GameScreen navigation={mockNavigation} />);
    await waitFor(() => {
      const gaps = getAllByText('____');
      expect(gaps.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('renders the Check button', async () => {
    const { getByText } = await render(<GameScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText('Check!')).toBeTruthy();
    });
  });

  it('shows result after checking answers', async () => {
    const { getByText } = await render(<GameScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText('Check!')).toBeTruthy();
    });
    await fireEvent.press(getByText('Check!'));
    await waitFor(() => {
      expect(getByText(/You got \d+ of \d+ right/)).toBeTruthy();
    });
  });

  it('shows Next Verse button after checking', async () => {
    const { getByText } = await render(<GameScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText('Check!')).toBeTruthy();
    });
    await fireEvent.press(getByText('Check!'));
    await waitFor(() => {
      expect(getByText('Next Verse')).toBeTruthy();
    });
  });

  it('calls goBack when Next Verse is pressed', async () => {
    const { getByText } = await render(<GameScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText('Check!')).toBeTruthy();
    });
    await fireEvent.press(getByText('Check!'));
    await waitFor(() => {
      expect(getByText('Next Verse')).toBeTruthy();
    });
    await fireEvent.press(getByText('Next Verse'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('initializes the database on mount', async () => {
    const { initDB } = require('../../src/services/db');
    await render(<GameScreen navigation={mockNavigation} />);
    expect(initDB).toHaveBeenCalledTimes(1);
  });

  it('fetches a verse on mount', async () => {
    const { getRandomVerses } = require('../../src/services/db');
    await render(<GameScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getRandomVerses).toHaveBeenCalledWith(1);
    });
  });
});
