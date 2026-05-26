const fetch = require('node-fetch');

const { detectQuestionType, analyzeSentiment, getFrustrationResponse, getResponsePrefix } = require('./utils/aiHelpers');
const trainingData = require('./utils/trainingData');

// Lightweight vocabulary enhancer: replaces common simple words with richer synonyms.
function enhanceVocabulary(text) {
  if (!text || typeof text !== 'string') return text;
  const synonyms = {
    'help': 'assist',
    'use': 'utilize',
    'show': 'demonstrate',
    'big': 'substantial',
    'small': 'minute',
    'start': 'commence',
    'change': 'transform',
    'think': 'consider',
    'ask': 'inquire',
    'important': 'significant',
    'good': 'commendable',
    'answer': 'response',
    'explain': 'elucidate'
  };

  let out = text;
  // Replace base words and simple inflections (s, ed, ing)
  for (const [simple, fancy] of Object.entries(synonyms)) {
    const re = new RegExp('\\b' + simple + '(?:s|ed|ing)?\\b', 'gi');
    out = out.replace(re, (match) => {
      // capture suffix if present
      const suffixMatch = match.match(new RegExp('(' + simple + ')(s|ed|ing)?$', 'i'));
      const suffix = (suffixMatch && suffixMatch[2]) ? suffixMatch[2] : '';
      let replacement = fancy;
      // attempt to append same simple suffix to the fancy word
      if (suffix) {
        replacement = fancy + suffix;
      }
      // Preserve capitalization of the first letter
      if (/[A-Z]/.test(match[0])) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  return out;
}

// Initialize our AI service
const initializeAI = () => {
  console.log('Hugging Face AI service initialized');
  
  // Check if the token is available
  if (!process.env.HUGGINGFACE_TOKEN) {
    console.warn('Warning: HUGGINGFACE_TOKEN environment variable not set. API calls may fail.');
  }
};

// Function to get response from Hugging Face API
async function generateResponse(question, options = {}) {
  // Define categories based on content
  const lowerQuestion = question.toLowerCase();
  
  const isMath = lowerQuestion.includes('calculate') || 
                 lowerQuestion.includes('math') ||
                 lowerQuestion.includes('1+1') ||
                 /[+\-*\/=]/.test(lowerQuestion) ||
                 /\d+/.test(lowerQuestion);
  
  const isHistory = lowerQuestion.includes('history') ||
                    lowerQuestion.includes('capital') ||
                    lowerQuestion.includes('philippines') ||
                    lowerQuestion.includes('president');

  const isScience = lowerQuestion.includes('science') ||
                    lowerQuestion.includes('evaporation') ||
                    lowerQuestion.includes('precipitation') ||
                    lowerQuestion.includes('water') ||
                    lowerQuestion.includes('chemical');

  // Determine the category based on keyword matching or override from options
  let category = 'general';
  if (isMath) category = 'math';
  if (isHistory) category = 'history';
  if (isScience) category = 'science';
  if (options.subject) {
    // Allow the caller to hint the subject (e.g., from frontend filter)
    const s = options.subject.toString().toLowerCase();
    if (s === 'math') category = 'math';
    if (s === 'science') category = 'science';
    if (s === 'history') category = 'history';
    if (s === 'programming' || s === 'code') category = 'programming';
    if (s === 'english') category = 'english';
  }

  // Check for direct matches to provide immediate responses without API call
  // This will bypass the API call for common questions we know will work
  // First, check trainingData for close matches (case-insensitive exact or substring)
  const findTrainingMatch = (q) => {
    const norm = (s) => String(s || '').toLowerCase().trim();
    // exact match first
    for (const item of trainingData) {
      if (norm(item.input) === norm(q)) return item;
    }
    // substring match (question contains training input or vice versa)
    for (const item of trainingData) {
      const inA = norm(q).includes(norm(item.input));
      const inB = norm(item.input).includes(norm(q));
      if (inA || inB) return item;
    }
    return null;
  };

  const tdMatch = findTrainingMatch(question);
  if (tdMatch) {
    const mappedCategory = tdMatch.subject ? tdMatch.subject.toLowerCase() : category;
    return {
      category: mappedCategory,
      response: enhanceVocabulary(tdMatch.output)
    };
  }

  // Analyze question type and sentiment to craft prompt
  const questionType = detectQuestionType(question);
  const sentimentScore = analyzeSentiment(question);
  const isFrustrated = sentimentScore < -0.3;

  // For other questions, try the API with a strict timeout
  try {
    // Using a smaller model that responds faster
    const API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
    
    // Build an enhanced prompt with clear instructions and a couple of short examples
    const prefix = isFrustrated ? getFrustrationResponse() : getResponsePrefix(questionType);

    const fewShot = `Example 1:
Q: What is evaporation?
A: Evaporation is the process where liquid water turns into water vapor. Example: puddles drying after rain. Quick summary: evaporation is liquid→gas.

Example 2:
Q: What is 2+2?
A: 2+2 = 4. Steps: 1) Identify numbers, 2) Add them. Quick summary: basic addition.
`;

    let input = `You are BrainBytes, a friendly, patient AI tutor. Be concise, avoid hallucinations, and do not fabricate facts. If you are unsure, say "I don't know" and suggest where to look.

Context:
- Subject hint: ${options.subject || category}
- Question type: ${questionType}
- User seems frustrated: ${isFrustrated}

Instructions:
- If the question type is "definition", start with a one-sentence definition.
- If the question type is "explanation", give a step-by-step explanation with short numbered steps.
- If the question type is "example", provide a concrete, relatable example.
- Always include a one-line "Quick summary:" at the end.
- Use simple language suitable for K-12 learners.
- Format your answer in plain Markdown. Use headings for sections when helpful.

${prefix}

${fewShot}

User question: ${question}
`.trim();

    // Get the token from environment variables
    const token = process.env.HUGGINGFACE_TOKEN;

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    // Make the API request with authentication and timeout
    const response = await fetch(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        inputs: input,
        options: {
          wait_for_model: false // Don't wait for model to be ready - faster responses
        }
      }),
    });

    // Clear the timeout since we got a response
    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      
      // If we get a 504 or other error, use our fallback
      return {
        category,
        response: enhanceVocabulary(getDetailedResponse(category, question))
      };
    }

    const result = await response.json();

    // Check if we got a valid response from the API
    if (result && result[0] && (result[0].generated_text || result[0].summary_text || result[0].label)) {
      const text = result[0].generated_text || result[0].summary_text || JSON.stringify(result[0]);
      return {
        category,
        response: enhanceVocabulary(text)
      };
    } else {
      // Use our fallback if the response format wasn't as expected
      return {
        category,
        response: enhanceVocabulary(getDetailedResponse(category, question))
      };
    }
  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    
    // Return a fallback response
    return {
      category,
      response: enhanceVocabulary(getDetailedResponse(category, question))
    };
  }
}

// More detailed fallback responses when the API call fails
function getDetailedResponse(category, question) {
  const lowerQuestion = question.toLowerCase();
  
  // Check for exact matches first
  if (lowerQuestion === 'what is 1+1' || lowerQuestion === '1+1') {
    return "The answer to 1+1 is 2.";
  }
  
  if (lowerQuestion === 'what is evaporation') {
    return "Evaporation is the process where liquid water changes into water vapor (gas). This happens when water molecules gain enough energy from heat to break free from the liquid's surface. Evaporation occurs at temperatures below water's boiling point and is a key part of the water cycle. It happens all around us - from wet clothes drying to puddles disappearing after rain.";
  }
  
  if (lowerQuestion === 'what is science') {
    return "Science is the systematic study of the natural world through observation, experimentation, and the formulation and testing of hypotheses. It aims to discover patterns and principles that help us understand how things work. The scientific method involves making observations, asking questions, forming hypotheses, conducting experiments, analyzing data, and drawing conclusions. Science encompasses many fields including physics, chemistry, biology, astronomy, geology, and more.";
  }
  
  // Handle science category
  if (category === 'science') {
    if (lowerQuestion.includes('precipitation')) {
      return "Precipitation is the release of water from the atmosphere to the earth's surface in the form of rain, snow, sleet, or hail. It's a key part of the water cycle where water vapor condenses in the atmosphere and becomes heavy enough to fall to the ground. Precipitation is essential for replenishing freshwater supplies and supporting plant and animal life.";
    }
    
    if (lowerQuestion.includes('evaporation')) {
      return "Evaporation is the process where liquid water changes into water vapor (gas). This happens when water molecules gain enough energy from heat to break free from the liquid's surface. Evaporation occurs at temperatures below water's boiling point and is a key part of the water cycle. It happens all around us - from wet clothes drying to puddles disappearing after rain.";
    }
    
    if (lowerQuestion.includes('science')) {
      return "Science is the systematic study of the natural world through observation, experimentation, and the formulation and testing of hypotheses. It aims to discover patterns and principles that help us understand how things work. The scientific method involves making observations, asking questions, forming hypotheses, conducting experiments, analyzing data, and drawing conclusions. Science encompasses many fields including physics, chemistry, biology, astronomy, geology, and more.";
    }
    
    return "That's an interesting science question! Science helps us understand the natural world through observation and experimentation. I'd be happy to explain more about this specific scientific topic if you provide more details.";
  }
  
  // Handle math category
  if (category === 'math') {
    if (lowerQuestion.includes('1+1')) {
      return "The answer to 1+1 is 2.";
    }
    return "I can help with your math question. In mathematics, it's important to understand the fundamental concepts and formulas. Could you provide more details about your specific math problem?";
  }
  
  // Handle history/geography category
  if (category === 'history') {
    if (lowerQuestion.includes('capital of the philippines')) {
      return "The capital of the Philippines is Manila. It's located on the island of Luzon and serves as the country's political, economic, and cultural center.";
    }
    if (lowerQuestion.includes('fish in filipino')) {
      return "The word for 'fish' in Filipino (Tagalog) is 'isda'.";
    }
    return "Interesting question about history or culture! I'd be happy to share more information about this topic if you provide more details.";
  }
  
  // Default response for general questions
  return "I'm not sure I understand your question completely. Could you please provide more details or rephrase it? I can help with topics related to science, math, history, and general knowledge.";
}

module.exports = {
  initializeAI,
  generateResponse,
  enhanceVocabulary
};


