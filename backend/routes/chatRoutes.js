// backend/routes/chatRoutes.js — ENHANCED VERSION
const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const {
  detectQuestionType,
  analyzeSentiment,
  getFrustrationResponse,
  getResponsePrefix,
  detectSubject,
} = require('../utils/aiHelpers');

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, userId, subject: subjectOverride } = req.body;

    if (!message) return res.status(400).json({ error: 'Message is required.' });

    // Analyze the incoming message
    const questionType = detectQuestionType(message);
    const sentimentScore = analyzeSentiment(message);
    const subject = subjectOverride || detectSubject(message);

    // Build the AI prompt with context
    const isFrustrated = sentimentScore < -0.3;
    const prefix = isFrustrated
      ? getFrustrationResponse() + '\n\n'
      : getResponsePrefix(questionType);

    // ---- YOUR EXISTING AI CALL GOES HERE ----
    // Replace the block below with your actual AI/model call.
    // The `enhancedPrompt` variable below shows how to pass context to your model.
    const enhancedPrompt = `
      You are BrainBytes, a friendly and patient AI tutor.
      Subject context: ${subject}
      Question type: ${questionType}
      User seems frustrated: ${isFrustrated}
      
      If the user is frustrated, be extra encouraging and simplify your explanation.
      If the question type is "definition", start with a clear one-sentence definition.
      If the question type is "example", provide a concrete, relatable example.
      If the question type is "explanation", break the concept into simple steps.
      
      User question: ${message}
    `.trim();

    // PLACEHOLDER — replace this with your actual model/AI call:
    // const aiResponse = await yourExistingAIFunction(enhancedPrompt);
    const aiResponse = prefix + "[AI response goes here — connect to your existing AI model using enhancedPrompt above]";
    // ---- END OF YOUR EXISTING AI CALL ----

    // Log the activity if userId is provided
    if (userId) {
      await ActivityLog.create({
        userId,
        subject,
        question: message,
        response: aiResponse,
        questionType,
        sentimentScore,
      });
    }

    res.json({
      response: aiResponse,
      metadata: { questionType, sentimentScore, subject, isFrustrated },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
