import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { useNotificationPermissions } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    useNotificationPermissions();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
});