// backend/utils/aiHelpers.js

/**
 * Detects the type of question the user is asking.
 * Returns: 'definition' | 'explanation' | 'example' | 'unknown'
 */
function detectQuestionType(text) {
  const lower = text.toLowerCase().trim();

  const definitionPatterns = [
    /^what is\b/,
    /^what are\b/,
    /^define\b/,
    /^what does .+ mean/,
    /\bmeaning of\b/,
    /\bdefinition of\b/,
    /\bwhat do you mean by\b/,
  ];

  const explanationPatterns = [
    /^how does\b/,
    /^how do\b/,
    /^why (is|are|does|do)\b/,
    /\bexplain\b/,
    /\bhow (does|do|can|would)\b/,
    /\bwhy\b/,
    /\bhow it works\b/,
    /\btell me about\b/,
  ];

  const examplePatterns = [
    /\bexample(s)?\b/,
    /\bfor instance\b/,
    /\bshow me\b/,
    /\bgive me an?\b/,
    /\bcan you show\b/,
    /\bsample\b/,
    /\bdemonstrate\b/,
  ];

  if (definitionPatterns.some((p) => p.test(lower))) return 'definition';
  if (examplePatterns.some((p) => p.test(lower))) return 'example';
  if (explanationPatterns.some((p) => p.test(lower))) return 'explanation';
  return 'unknown';
}

/**
 * Basic sentiment analysis.
 * Returns a score from -1 (very frustrated) to 1 (very positive).
 */
function analyzeSentiment(text) {
  const lower = text.toLowerCase();

  const frustratedWords = [
    "don't understand", "confused", "doesn't make sense", "hard",
    "difficult", "lost", "stuck", "frustrated", "makes no sense",
    "i give up", "can't get it", "still don't get", "why isn't",
    "not working", "wrong", "stupid", "useless", "terrible", "hate",
    "awful", "worst",
  ];

  const positiveWords = [
    "thanks", "thank you", "got it", "i understand", "makes sense",
    "great", "awesome", "helpful", "good", "perfect", "nice", "cool",
    "love it", "excellent", "amazing", "brilliant", "clear now",
  ];

  let score = 0;
  frustratedWords.forEach((w) => { if (lower.includes(w)) score -= 0.2; });
  positiveWords.forEach((w) => { if (lower.includes(w)) score += 0.2; });

  // Clamp to [-1, 1]
  return Math.max(-1, Math.min(1, score));
}

/**
 * Generates a comforting prefix message when a user seems frustrated.
 */
function getFrustrationResponse() {
  const responses = [
    "It sounds like this is tricky — that's totally okay! Let's slow down and go step by step. 😊",
    "Don't worry, this concept trips up a lot of people. Let me try explaining it a different way.",
    "You're not alone — this is a tough one! Let's break it down together.",
    "I can see this is confusing. No problem at all — let me give you a simpler explanation.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Formats the AI response prefix based on question type.
 */
function getResponsePrefix(questionType) {
  switch (questionType) {
    case 'definition':
      return "Here's the definition: ";
    case 'explanation':
      return "Let me explain that: ";
    case 'example':
      return "Here's an example to illustrate: ";
    default:
      return "";
  }
}

/**
 * Detects the subject from the message text.
 * Returns: one of the subject enum values.
 */
function detectSubject(text) {
  const lower = text.toLowerCase();
  if (/\b(math|algebra|calculus|geometry|equation|number|fraction|percentage|formula)\b/.test(lower)) return 'Math';
  if (/\b(science|physics|chemistry|biology|atom|molecule|cell|energy|force|experiment)\b/.test(lower)) return 'Science';
  if (/\b(history|war|revolution|empire|ancient|century|historical|civilization)\b/.test(lower)) return 'History';
  if (/\b(english|grammar|verb|noun|sentence|essay|literature|poem|writing|reading)\b/.test(lower)) return 'English';
  if (/\b(code|coding|programming|function|variable|loop|array|python|javascript|algorithm|debug)\b/.test(lower)) return 'Programming';
  return 'General';
}

module.exports = { detectQuestionType, analyzeSentiment, getFrustrationResponse, getResponsePrefix, detectSubject };
