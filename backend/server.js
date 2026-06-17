require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const aiService = require('./aiService');
const app = require('./app');
const PORT = process.env.PORT || 5000;

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


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
