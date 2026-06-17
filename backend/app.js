require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const aiService = require('./aiService');
const userProfileRoutes = require('./routes/userProfileRoutes');
const learningMaterialRoutes = require('./routes/learningMaterialRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const messageSchema = new mongoose.Schema({
  text: String,
  isUser: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

const chatHistory = global.__CHAT_HISTORY__ || new Map();
global.__CHAT_HISTORY__ = chatHistory;

function storeChatMessage(sessionId, message) {
  const key = sessionId || 'default';
  const existing = chatHistory.get(key) || [];
  chatHistory.set(key, [...existing, message]);
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the BrainBytes API' });
});

app.get('/api/messages', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const messages = await Message.find().sort({ createdAt: 1 });
      return res.json(messages);
    }

    global.__TEMP_MESSAGES__ = global.__TEMP_MESSAGES__ || [];
    return res.json(global.__TEMP_MESSAGES__.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const rawText = req.body.text || '';
    const text = rawText.toString().trim();
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    if (text.length > 1000) return res.status(400).json({ error: 'Message is too long (max 1000 characters).' });

    const safeText = text.replace(/[\u0000-\u001F\u007F]/g, '');

    let userMessage;
    try {
      if (mongoose.connection.readyState === 1) {
        userMessage = new Message({ text: safeText, isUser: true });
        await userMessage.save();
      } else {
        throw new Error('DB not connected');
      }
    } catch (saveErr) {
      global.__TEMP_MESSAGES__ = global.__TEMP_MESSAGES__ || [];
      userMessage = { text: safeText, isUser: true, createdAt: new Date() };
      global.__TEMP_MESSAGES__.push(userMessage);
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );

    const aiResultPromise = aiService.generateResponse(safeText, { subject: req.body.subject, userId: req.body.userId });

    const aiResult = await Promise.race([aiResultPromise, timeoutPromise]).catch(() => ({
      category: 'error',
      response: "I'm sorry, but I couldn't process your request in time. Please try again with a simpler question."
    }));

    const rawAiText = aiResult && aiResult.response ? aiResult.response : "I'm sorry, I couldn't process that. Please try again.";
    const aiText = (aiService.enhanceVocabulary && typeof aiService.enhanceVocabulary === 'function') ? aiService.enhanceVocabulary(rawAiText) : rawAiText;

    let aiMessage;
    try {
      if (mongoose.connection.readyState === 1) {
        aiMessage = new Message({ text: aiText, isUser: false });
        await aiMessage.save();
      } else {
        throw new Error('DB not connected');
      }
    } catch (saveErr) {
      global.__TEMP_MESSAGES__ = global.__TEMP_MESSAGES__ || [];
      aiMessage = { text: aiText, isUser: false, createdAt: new Date() };
      global.__TEMP_MESSAGES__.push(aiMessage);
    }

    res.status(201).json({
      userMessage,
      aiMessage,
      category: aiResult && aiResult.category ? aiResult.category : 'general'
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/chat/send', async (req, res) => {
  try {
    const message = String(req.body.message || '').trim();
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const sessionId = req.body.sessionId || 'default';
    const userMessage = { text: message, isUser: true, createdAt: new Date().toISOString(), sessionId };
    const aiMessage = {
      text: `I received: ${message}`,
      isUser: false,
      createdAt: new Date().toISOString(),
      sessionId
    };

    storeChatMessage(sessionId, userMessage);
    storeChatMessage(sessionId, aiMessage);

    return res.status(200).json({ userMessage, aiMessage });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/chat/history/:sessionId', (req, res) => {
  const messages = chatHistory.get(req.params.sessionId) || [];
  res.status(200).json({ messages });
});

app.use('/api/profiles', userProfileRoutes);
app.use('/api/materials', learningMaterialRoutes);
app.use('/api/activity', activityLogRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;