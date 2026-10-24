import React from 'react';
import { render } from '@testing-library/react-native';
import RootNavigator from '../../src/navigation/RootNavigator';

jest.mock('@expo-google-fonts/inter', () => ({
  useFonts: jest.fn(() => [true]),
  Inter_400Regular: 'Inter_400Regular',
}));

jest.mock('../../src/services/update', () => ({
  checkForUpdate: jest.fn(async () => null),
}));

jest.mock('../../src/services/db', () => ({
  initDB: jest.fn(async () => {}),
  getRandomVerses: jest.fn(async () => []),
}));

describe('RootNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { toJSON } = await render(<RootNavigator />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows Home screen initially', async () => {
    const { getByText } = await render(<RootNavigator />);
    expect(getByText('Bible Gap')).toBeTruthy();
  });

  it('renders Play button on Home screen', async () => {
    const { getByText } = await render(<RootNavigator />);
    expect(getByText('Play')).toBeTruthy();
  });
});
