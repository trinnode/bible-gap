import * as React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useState, useEffect } from 'react';
import { getRandomVerses, initDB, warmUpVerses } from '../services/db';
import { generateGaps, scoreAnswers } from '../utils/gapLogic';
import { useAppFonts } from '../hooks/useAppFonts';

interface VerseItem {
  reference: string;
  text: string;
  version: string;
}

export default function GameScreen({ navigation }: any) {
  const [fontsLoaded] = useAppFonts();
  const [verse, setVerse] = useState<VerseItem | null>(null);
  const [gapOptions, setGapOptions] = useState<string[][]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showResult, setShowResult] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const watchdog = setTimeout(() => setLoadFailed(true), 6000);
    return () => clearTimeout(watchdog);
  }, []);

  useEffect(() => {
    let cancelled = false;
    initDB()
      .then(() => getRandomVerses(1))
      .then(verses => {
        if (cancelled || !verses.length) return;
        const v = verses[0];
        setVerse(v);
        const { options, answers: ans } = generateGaps(v.text);
        setGapOptions(options);
        setAnswers(ans);
      })
      .catch(() => {
        // DB failed — nothing we can do; loading state persists with error text.
        if (!cancelled) setVerse(null);
      });
    // Network enrichment runs in the background; never blocks gameplay.
    warmUpVerses();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (gapIndex: number, chosen: string) => {
    const newAnswers = [...answers];
    newAnswers[gapIndex] = chosen;
    setAnswers(newAnswers);
  };

  const checkAnswers = () => {
    setIsChecking(true);
    const { correct, total, percentage } = scoreAnswers(
      answers,
      verse?.text ?? ''
    );
    setShowResult(`You got ${correct} of ${total} right (${percentage}%)`);
    setIsChecking(false);
  };

  if (!fontsLoaded || !verse) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          {loadFailed ? 'Could not load a verse. Please restart the app.' : 'Loading...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.verseHeader}>
        <Text style={styles.reference}>{verse?.reference}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.verseTextContainer}>
        {verse.text?.split(/\s+/).map((word, i) => {
          const isGap = gapOptions[i] && gapOptions[i].length > 0;
          if (isGap) {
            return (
              <View key={i} style={styles.gapWrapper}>
                <Text style={styles.gapPlaceholder}>____</Text>
                {gapOptions[i].map((opt, j) => (
                  <TouchableOpacity
                    key={j}
                    style={styles.optionButton}
                    onPress={() => handleSelect(i, opt)}
                  >
                    <Text style={styles.optionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          } else {
            return <Text key={i} style={styles.normalWord}>{word} </Text>;
          }
        })}
      </ScrollView>

      <View style={styles.checkButtonContainer}>
        <TouchableOpacity style={styles.checkButton} onPress={checkAnswers} disabled={isChecking}>
          <Text style={styles.checkButtonText}>{isChecking ? 'Checking…' : 'Check!'}</Text>
        </TouchableOpacity>
      </View>

      {showResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{showResult}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={() => navigation.goBack()}>
            <Text style={styles.restartText}>Next Verse</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  verseHeader: {
    padding: 12,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
  },
  reference: {
    fontFamily: 'Playfair Display',
    fontStyle: 'italic',
    color: '#ecf0f1',
    fontSize: 18,
  },
  verseTextContainer: {
    padding: 16,
    borderRadius: 8,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gapWrapper: {
    marginBottom: 8,
  },
  gapPlaceholder: {
    fontFamily: 'Playfair Display',
    fontSize: 18,
    color: '#7f8c8d',
    marginRight: 6,
  },
  optionButton: {
    backgroundColor: '#e86e2f',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  optionText: {
    color: '#fff',
    fontFamily: 'Inter',
    fontSize: 14,
  },
  normalWord: {
    fontFamily: 'Inter',
    fontSize: 18,
    color: '#2c3e50',
  },
  checkButtonContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  checkButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 12,
  },
  checkButtonText: {
    color: '#fff',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
  resultBox: {
    padding: 16,
    margin: 12,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 16,
    textAlign: 'center',
  },
  restartButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  restartText: {
    color: '#2c3e50',
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
