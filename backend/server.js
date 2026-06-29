require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const aiService = require('./aiService');
const app = require('./app');
const PORT = process.env.PORT || 5000;

// Initialize AI model
aiService.initializeAI();

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

      // CRITICAL FIX: Prevent ephemeral in-memory databases from running on your live production server
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: Database connection failed in production mode. Refusing to start ephemeral fallback.');
        process.exit(1);
      }

      try {
        console.warn('Starting in-memory MongoDB for local development...');
        const mongod = await MongoMemoryServer.create();
        const inMemoryUri = mongod.getUri();
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

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});