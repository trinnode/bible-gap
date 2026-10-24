import { requestNotificationPermissions } from '../../src/services/notifications';

const mockGetPermissions = jest.fn();
const mockRequestPermissions = jest.fn();
const mockScheduleNotification = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: any[]) => mockGetPermissions(...args),
  requestPermissionsAsync: (...args: any[]) => mockRequestPermissions(...args),
  scheduleNotificationAsync: (...args: any[]) => mockScheduleNotification(...args),
  SchedulableTriggerInputTypes: {
    CALENDAR: 'calendar',
  },
}));

describe('requestNotificationPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns "granted" when permissions already granted', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'granted' });

    const status = await requestNotificationPermissions();
    expect(status).toBe('granted');
    expect(mockRequestPermissions).not.toHaveBeenCalled();
  });

  it('requests permissions when not granted', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });

    const status = await requestNotificationPermissions();
    expect(status).toBe('granted');
    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
  });

  it('schedules daily notification when granted', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'granted' });

    await requestNotificationPermissions();
    expect(mockScheduleNotification).toHaveBeenCalledTimes(1);
    expect(mockScheduleNotification).toHaveBeenCalledWith({
      content: {
        title: 'Daily Verse',
        body: 'Tap to play a new gap-fill verse!',
      },
      trigger: {
        type: 'calendar',
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  });

  it('does NOT schedule notification when denied', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'denied' });
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });

    const status = await requestNotificationPermissions();
    expect(status).toBe('denied');
    expect(mockScheduleNotification).not.toHaveBeenCalled();
  });

  it('returns "denied" when user rejects permissions', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });

    const status = await requestNotificationPermissions();
    expect(status).toBe('denied');
    expect(mockScheduleNotification).not.toHaveBeenCalled();
  });
});
