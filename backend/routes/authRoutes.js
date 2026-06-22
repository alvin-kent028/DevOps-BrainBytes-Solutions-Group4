const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserProfile = require('../models/UserProfile');

// Helpful GET endpoints to show usage when someone visits via browser
router.get('/register', (req, res) => {
  return res.status(200).json({
    message: 'Use POST /api/auth/register with JSON body { name, email, preferredSubjects?, avatar? } to create a profile and receive a JWT.'
  });
});

router.get('/login', (req, res) => {
  return res.status(200).json({
    message: 'Use POST /api/auth/login with JSON body { email, password } to receive a JWT for an existing profile.'
  });
});

// 1. CLEANED UP LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Lookup profile matching the email
    const user = await UserProfile.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Use a generic message to avoid leaking whether the email exists
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Validate the provided password against the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Set a reliable secret fallback if process.env.JWT_SECRET is missing
    const secretKey = process.env.JWT_SECRET || 'fallback_secret_key_for_testing';

    const payload = { id: user._id, email: user.email, name: user.name };
    const token = jwt.sign(payload, secretKey, { expiresIn: '7d' });

    return res.json({ 
      message: "Login successful",
      token, 
      user: payload 
    });
  } catch (err) {
    console.error("Login route error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 2. CLEANED UP REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, preferredSubjects, avatar } = req.body;
    
    // Accept either name or username field from frontend matching your schema mapping
    const finalName = name || username;

    if (!email || !finalName) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const existing = await UserProfile.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'A profile with this email already exists.' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 12);

    const profile = new UserProfile({ 
      name: finalName.trim(), 
      email: email.toLowerCase().trim(), 
      password: hashedPassword,
      preferredSubjects, 
      avatar 
    });
    await profile.save();

    const secretKey = process.env.JWT_SECRET || 'fallback_secret_key_for_testing';
    const payload = { id: profile._id, email: profile.email, name: profile.name };
    const token = jwt.sign(payload, secretKey, { expiresIn: '7d' });

    return res.status(201).json({ 
      message: "Registration successful",
      token, 
      user: payload 
    });
  } catch (err) {
    console.error("Registration route error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 3. CLEANED UP LOGOUT ROUTE
router.post('/logout', (req, res) => {
  try {
    return res.status(200).json({ 
      success: true, 
      message: "Session ended. Please remove token from local storage." 
    });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong during logout" });
  }
});

module.exports = router;