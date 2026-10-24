import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { requestNotificationPermissions } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
});
