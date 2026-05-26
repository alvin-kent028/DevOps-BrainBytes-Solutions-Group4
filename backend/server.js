require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const aiService = require('./aiService');
const userProfileRoutes = require('./routes/userProfileRoutes');
const learningMaterialRoutes = require('./routes/learningMaterialRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI model
aiService.initializeAI();

// Connect to MongoDB with a sensible fallback for local development.
// Prefer an explicit MONGO_URI environment variable. When not provided
// try the Docker service hostname first (mongo), then fall back to
// localhost for systems running a local MongoDB instance.
const primaryMongo = process.env.MONGO_URI || 'mongodb://mongo:27017/brainbytes';
const fallbackMongo = 'mongodb://localhost:27017/brainbytes';

const { MongoMemoryServer } = require('mongodb-memory-server');

async function connectWithFallback() {
  try {
    await mongoose.connect(primaryMongo, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true
    });
    console.log('Connected to MongoDB:', primaryMongo);
  } catch (errPrimary) {
    console.warn('Primary MongoDB connection failed:', errPrimary.message);
    // If the primary was explicitly set via env, don't try fallback.
    if (process.env.MONGO_URI) {
      console.error('Failed to connect to MongoDB (MONGO_URI).');
      return;
    }

    try {
      await mongoose.connect(fallbackMongo, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true
      });
      console.log('Connected to MongoDB (fallback):', fallbackMongo);
    } catch (errFallback) {
      console.error('Failed to connect to MongoDB (both primary and fallback):', errFallback.message || errFallback);

      // As a last-resort for local development, start an in-memory MongoDB.
      try {
        console.warn('Starting in-memory MongoDB for local development...');
        const mongod = await MongoMemoryServer.create();
        const inMemoryUri = mongod.getUri();
        // Keep reference so it isn't GC'd and we can stop it if needed
        global.__MONGOD__ = mongod;
        await mongoose.connect(inMemoryUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          retryWrites: true
        });
        console.log('Connected to in-memory MongoDB');
      } catch (errMem) {
        console.error('Failed to start in-memory MongoDB:', errMem);
      }
    }
  }
}

connectWithFallback();

// Define schemas
const messageSchema = new mongoose.Schema({
  text: String,
  isUser: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the BrainBytes API' });
});

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const messages = await Message.find().sort({ createdAt: 1 });
      return res.json(messages);
    }
    // Fallback to in-memory messages when DB is not connected
    global.__TEMP_MESSAGES__ = global.__TEMP_MESSAGES__ || [];
    return res.json(global.__TEMP_MESSAGES__.slice().sort((a,b)=> new Date(a.createdAt)-new Date(b.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new message and get AI response
app.post('/api/messages', async (req, res) => {
  try {
    // Validate and sanitize incoming text
    const rawText = req.body.text || '';
    const text = rawText.toString().trim();
    if (!text) return res.status(400).json({ error: 'Message text is required.' });
    if (text.length > 1000) return res.status(400).json({ error: 'Message is too long (max 1000 characters).' });

    // Remove control characters for safety
    const safeText = text.replace(/[\u0000-\u001F\u007F]/g, '');

    // Save user message (DB first; fallback to in-memory store when DB not ready)
    let userMessage;
    try {
      if (mongoose.connection.readyState === 1) {
        userMessage = new Message({ text: safeText, isUser: true });
        await userMessage.save();
      } else {
        throw new Error('DB not connected');
      }
    } catch (saveErr) {
      // Use lightweight in-memory storage for immediate testing
      console.warn('DB save failed, using in-memory store:', saveErr.message);
      global.__TEMP_MESSAGES__ = global.__TEMP_MESSAGES__ || [];
      userMessage = { text: safeText, isUser: true, createdAt: new Date() };
      global.__TEMP_MESSAGES__.push(userMessage);
    }
    
    // Generate AI response with a 15-second overall timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );
    
    const aiResultPromise = aiService.generateResponse(safeText, { subject: req.body.subject, userId: req.body.userId });
    
    // Race between the AI response and the timeout
    const aiResult = await Promise.race([aiResultPromise, timeoutPromise])
      .catch(error => {
        console.error('AI response timed out or failed:', error);
        return {
          category: 'error',
          response: "I'm sorry, but I couldn't process your request in time. Please try again with a simpler question."
        };
      });
    
    // Save AI response (ensure vocabulary enhancement applied)
    const rawAiText = (aiResult && aiResult.response) ? aiResult.response : "I'm sorry, I couldn't process that. Please try again.";
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
      console.warn('DB save failed for AI message, using in-memory store:', saveErr.message);
      global.__TEMP_MESSAGES__ = global.__TEMP_MESSAGES__ || [];
      aiMessage = { text: aiText, isUser: false, createdAt: new Date() };
      global.__TEMP_MESSAGES__.push(aiMessage);
    }
    
    // Return both messages
    res.status(201).json({
      userMessage,
      aiMessage,
      category: aiResult && aiResult.category ? aiResult.category : 'general'
    });
  } catch (err) {
    console.error('Error in /api/messages route:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Register new routes
app.use('/api/profiles', userProfileRoutes);
app.use('/api/materials', learningMaterialRoutes);
app.use('/api/activity', activityLogRoutes);
app.use('/api/auth', authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
