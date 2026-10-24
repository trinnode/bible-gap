import * as React from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { checkForUpdate } from '../services/update';
import { initDB, warmUpVerses } from '../services/db';
import { useAppFonts } from '../hooks/useAppFonts';

export default function HomeScreen({ navigation }: any) {
  const [fontsLoaded] = useAppFonts();

  React.useEffect(() => {
    // Seed the DB (instant, offline) then enrich from network in background.
    initDB().then(() => warmUpVerses());
    checkForUpdate().then(v => {
      if (v) {
        console.log('Update available:', v);
      }
    }).catch(() => {});
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading Bible Gap...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bible Gap</Text>
      <Text style={styles.subtitle}>Fill in the gaps to complete the verse</Text>
      <Button title="Play" onPress={() => navigation.navigate('Game')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 32,
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    marginBottom: 24,
    color: '#5a6c7d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter',
    marginHorizontal: 8,
  },
});