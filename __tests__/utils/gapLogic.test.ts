import { generateGaps, scoreAnswers } from '../../src/utils/gapLogic';

describe('generateGaps', () => {
  const sampleVerse =
    'For God so loved the world that he gave his one and only Son that whoever believes in him shall not perish but have eternal life';

  it('returns empty result for empty string', () => {
    const result = generateGaps('');
    expect(result.gapIndices.size).toBe(0);
    expect(result.options).toEqual([]);
    expect(result.answers).toEqual([]);
  });

  it('returns empty result for whitespace-only string', () => {
    const result = generateGaps('   ');
    expect(result.gapIndices.size).toBe(0);
  });

  it('generates at least 4 gaps for a short verse', () => {
    const shortVerse = 'In the beginning God created';
    const result = generateGaps(shortVerse, 4);
    expect(result.gapIndices.size).toBeGreaterThanOrEqual(4);
  });

  it('generates at least minGaps gaps when minGaps > 4', () => {
    const result = generateGaps(sampleVerse, 6);
    expect(result.gapIndices.size).toBeGreaterThanOrEqual(6);
  });

  it('never generates more gaps than words', () => {
    const threeWords = 'one two three';
    const result = generateGaps(threeWords, 10);
    expect(result.gapIndices.size).toBeLessThanOrEqual(3);
  });

  it('options array has same length as word count', () => {
    const result = generateGaps(sampleVerse);
    const wordCount = sampleVerse.split(/\s+/).filter(Boolean).length;
    expect(result.options.length).toBe(wordCount);
    expect(result.answers.length).toBe(wordCount);
  });

  it('gap positions have exactly 4 options each', () => {
    const result = generateGaps(sampleVerse, 4);
    for (const idx of result.gapIndices) {
      expect(result.options[idx].length).toBe(4);
    }
  });

  it('non-gap positions have empty options and empty answer', () => {
    const result = generateGaps(sampleVerse, 4);
    for (let i = 0; i < result.options.length; i++) {
      if (!result.gapIndices.has(i)) {
        expect(result.options[i]).toEqual([]);
        expect(result.answers[i]).toBe('');
      }
    }
  });

  it('the correct answer is always among the options for each gap', () => {
    const result = generateGaps(sampleVerse, 4);
    const words = sampleVerse.split(/\s+/).filter(Boolean);
    for (const idx of result.gapIndices) {
      expect(result.options[idx]).toContain(words[idx]);
      expect(result.answers[idx]).toBe(words[idx]);
    }
  });

  it('gap indices are unique', () => {
    const result = generateGaps(sampleVerse, 8);
    const indices = Array.from(result.gapIndices);
    const unique = new Set(indices);
    expect(unique.size).toBe(indices.length);
  });

  it('all gap indices are within bounds', () => {
    const words = sampleVerse.split(/\s+/).filter(Boolean);
    const result = generateGaps(sampleVerse, 4);
    for (const idx of result.gapIndices) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(words.length);
    }
  });

  it('distractors are never the same word (no duplicate options)', () => {
    const result = generateGaps(sampleVerse, 4);
    for (const idx of result.gapIndices) {
      const opts = result.options[idx];
      const uniqueOpts = new Set(opts);
      expect(uniqueOpts.size).toBe(opts.length);
    }
  });
});

describe('scoreAnswers', () => {
  const verse = 'For God so loved the world that he gave his one and only Son';

  it('returns 0 correct and 0 total for all empty answers', () => {
    const result = scoreAnswers(['', '', '', '', ''], verse);
    expect(result.correct).toBe(0);
    expect(result.total).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it('returns 100% when all answers are correct', () => {
    const words = verse.split(/\s+/);
    const result = scoreAnswers([...words], verse);
    expect(result.correct).toBe(words.length);
    expect(result.total).toBe(words.length);
    expect(result.percentage).toBe(100);
  });

  it('returns 0% when all answers are wrong', () => {
    const words = verse.split(/\s+/);
    const wrong = words.map(() => 'WRONG');
    const result = scoreAnswers(wrong, verse);
    expect(result.correct).toBe(0);
    expect(result.total).toBe(words.length);
    expect(result.percentage).toBe(0);
  });

  it('returns correct percentage for mixed answers', () => {
    const words = verse.split(/\s+/);
    const mixed = words.map((w, i) => (i % 2 === 0 ? w : 'WRONG'));
    const result = scoreAnswers(mixed, verse);
    const expectedCorrect = Math.ceil(words.length / 2);
    expect(result.correct).toBe(expectedCorrect);
    expect(result.total).toBe(words.length);
    expect(result.percentage).toBe(
      Math.round((expectedCorrect / words.length) * 100)
    );
  });

  it('does not count empty strings toward the total', () => {
    const result = scoreAnswers(['For', '', '', 'loved'], verse);
    expect(result.total).toBe(2);
  });

  it('is case-sensitive', () => {
    const result = scoreAnswers(['FOR', '', '', ''], verse);
    expect(result.correct).toBe(0);
    expect(result.total).toBe(1);
  });

  it('handles verse longer than answers array', () => {
    const result = scoreAnswers(['For'], verse);
    expect(result.total).toBe(1);
    expect(result.correct).toBe(1);
    expect(result.percentage).toBe(100);
  });

  it('handles answers array longer than verse', () => {
    const result = scoreAnswers(['For', 'extra', 'words'], verse);
    // 'extra' and 'words' will mismatch against actual verse words
    expect(result.total).toBe(3);
  });
});
