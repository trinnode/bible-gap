import * as React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { useState, useEffect } from 'react';
import { getRandomVerses, initDB } from '../services/db';

interface VerseItem {
  reference: string;
  text: string;
  version: string;
}

export default function GameScreen({ navigation }: any) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });
  const [verse, setVerse] = useState<VerseItem | null>(null);
  const [gapOptions, setGapOptions] = useState<string[][]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showResult, setShowResult] = useState<string | null>(null);

  useEffect(() => {
    initDB().then(() => getRandomVerses(1).then(verses => {
      if (verses.length) {
        const v = verses[0];
        setVerse(v);
        // generate gaps once verse is loaded
        const words = v.text.split(/\s+/);
        const gapCount = Math.max(4, Math.floor(words.length * 0.2));
        const gapIndices = new Set<number>();
        while (gapIndices.size < gapCount) {
          gapIndices.add(Math.floor(Math.random() * words.length));
        }
        const optsList: string[][] = [];
        const ansList: string[] = [];
        words.forEach((w, i) => {
          if (gapIndices.has(i)) {
            const distractors = words.filter((_ , idx) => !gapIndices.has(idx));
            const opts = [w, ...distractors.sort(() => Math.random() - 0.5).slice(0, 3)];
            optsList.push(opts);
            ansList.push(w);
          } else {
            optsList.push([]);
            ansList.push('');
          }
        });
        setGapOptions(optsList);
        setAnswers(ansList);
      }
    }));
  }, []);

  const handleSelect = (gapIndex: number, chosen: string) => {
    const newAnswers = [...answers];
    newAnswers[gapIndex] = chosen;
    setAnswers(newAnswers);
  };

  const checkAnswers = () => {
    setIsChecking(true);
    let correct = 0;
    answers.forEach((ans, i) => {
      const original = verse?.text.split(/\s+/)[i];
      if (ans === original) correct++;
    });
    const total = gapOptions.length;
    const percentage = total ? Math.round((correct / total) * 100) : 0;
    setShowResult(`You got ${correct} of ${total} right (${percentage}%)`);
    setIsChecking(false);
  };

  if (!fontsLoaded || !verse) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
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
          {isChecking ? 'Checking…' : 'Check!'}
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
    background: '#fff',
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
  checkButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 12,
  },
  resultBox: {
    padding: 16,
    background: '#ecf0f1',
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