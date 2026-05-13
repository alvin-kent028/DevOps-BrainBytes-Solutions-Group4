// backend/routes/userProfileRoutes.js
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');

// CREATE — POST /api/profiles
router.post('/', async (req, res) => {
  try {
    const { name, email, preferredSubjects, avatar } = req.body;

    const existing = await UserProfile.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'A profile with this email already exists.' });
    }

    const profile = new UserProfile({ name, email, preferredSubjects, avatar });
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL — GET /api/profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await UserProfile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE — GET /api/profiles/:id
router.get('/:id', async (req, res) => {
  try {
    const profile = await UserProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE — PUT /api/profiles/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, email, preferredSubjects, avatar } = req.body;
    const profile = await UserProfile.findByIdAndUpdate(
      req.params.id,
      { name, email, preferredSubjects, avatar },
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — DELETE /api/profiles/:id
router.delete('/:id', async (req, res) => {
  try {
    const profile = await UserProfile.findByIdAndDelete(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    res.json({ message: 'Profile deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
