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
const localFallbackMongo = 'mongodb://127.0.0.1:27017/brainbytes';
const usesDockerMongoHost = /^mongodb:\/\/mongo(:\d+)?\//.test(primaryMongo);

async function connectWithFallback() {
  try {
    await mongoose.connect(primaryMongo);
    console.log('Connected to MongoDB:', primaryMongo);
  } catch (errPrimary) {
    console.warn('Primary MongoDB connection failed:', errPrimary.message);

    if (process.env.NODE_ENV === 'production' && !usesDockerMongoHost) {
      console.error('Failed to connect to MongoDB (MONGO_URI) in production. Exiting.');
      return;
    }

    const fallbackTarget = usesDockerMongoHost ? localFallbackMongo : localFallbackMongo;
    try {
      await mongoose.connect(fallbackTarget);
      console.log('Connected to MongoDB (fallback):', fallbackTarget);
    } catch (errFallback) {
      console.warn('Fallback MongoDB connection failed:', errFallback.message);

      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: Database connection failed in production mode. Refusing to start ephemeral fallback.');
        process.exit(1);
      }

      try {
        console.warn('Starting in-memory MongoDB for local development...');
        // Require dynamically only when running locally
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const inMemoryUri = mongod.getUri();
        global.__MONGOD__ = mongod;
        await mongoose.connect(inMemoryUri);
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