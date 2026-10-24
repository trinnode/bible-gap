import * as Notifications from 'expo-notifications';

export const useNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let status = existingStatus;
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    status = newStatus;
  }
  if (status === 'granted') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Verse',
        body: 'Tap to play a new gap-fill verse!',
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  }
  return status;
};