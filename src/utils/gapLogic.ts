export interface GapResult {
  gapIndices: Set<number>;
  options: string[][];
  answers: string[];
}

export const generateGaps = (
  text: string,
  minGaps: number = 4
): GapResult => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return { gapIndices: new Set(), options: [], answers: [] };
  }

  const gapCount = Math.max(minGaps, Math.floor(words.length * 0.2));
  const maxPossibleGaps = words.length;
  const actualGapCount = Math.min(gapCount, maxPossibleGaps);

  const gapIndices = new Set<number>();
  while (gapIndices.size < actualGapCount) {
    gapIndices.add(Math.floor(Math.random() * words.length));
  }

  const options: string[][] = [];
  const answers: string[] = [];

  words.forEach((word, i) => {
    if (gapIndices.has(i)) {
      const nonGapWords = words.filter((_, idx) => !gapIndices.has(idx));
      const distractors = nonGapWords.sort(() => Math.random() - 0.5).slice(0, 3);
      const opts = [word, ...distractors];
      options.push(opts);
      answers.push(word);
    } else {
      options.push([]);
      answers.push('');
    }
  });

  return { gapIndices, options, answers };
};

export const scoreAnswers = (
  userAnswers: string[],
  originalText: string
): { correct: number; total: number; percentage: number } => {
  const originalWords = originalText.split(/\s+/).filter(Boolean);
  let correct = 0;
  let total = 0;

  userAnswers.forEach((ans, i) => {
    if (ans !== '') {
      total++;
      if (ans === originalWords[i]) correct++;
    }
  });

  const percentage = total ? Math.round((correct / total) * 100) : 0;
  return { correct, total, percentage };
};
