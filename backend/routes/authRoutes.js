const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserProfile = require('../models/UserProfile');

// Helpful GET endpoints to show usage when someone visits via browser
router.get('/register', (req, res) => {
  return res.status(200).json({
    message: 'Use POST /api/auth/register with JSON body { name, email, preferredSubjects?, avatar? } to create a profile and receive a JWT.'
  });
});

router.get('/login', (req, res) => {
  return res.status(200).json({
    message: 'Use POST /api/auth/login with JSON body { email } to receive a JWT for an existing profile.'
  });
});

// POST /api/auth/login  { email }
// For demo purposes: issue a token if a profile with the email exists.
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await UserProfile.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'User not found.' });

    const payload = { id: user._id, email: user.email, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register  { name, email, preferredSubjects, avatar }
// Creates a profile and returns a JWT for convenience.
router.post('/register', async (req, res) => {
  try {
    const { name, email, preferredSubjects, avatar } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Name and email are required.' });

    const existing = await UserProfile.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'A profile with this email already exists.' });

    const profile = new UserProfile({ name, email: email.toLowerCase().trim(), preferredSubjects, avatar });
    await profile.save();

    const payload = { id: profile._id, email: profile.email, name: profile.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
