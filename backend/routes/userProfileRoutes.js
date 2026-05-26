// backend/routes/userProfileRoutes.js
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const auth = require('../middleware/auth');

// CREATE — POST /api/profiles
router.post('/', async (req, res) => {
  try {
    const { name, email, preferredSubjects, avatar } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await UserProfile.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'A profile with this email already exists.' });
    }

    const profile = new UserProfile({ name, email: normalizedEmail, preferredSubjects, avatar });
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

// UPDATE — PUT /api/profiles/:id (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user || String(req.user.id) !== String(req.params.id)) return res.status(403).json({ error: 'Forbidden. You can only update your own profile.' });
    const { name, email, preferredSubjects, avatar } = req.body;
    const normalizedEmail = email ? String(email).toLowerCase().trim() : undefined;
    // If the caller is changing email, ensure no other profile has it
    if (normalizedEmail) {
      const conflict = await UserProfile.findOne({ email: normalizedEmail, _id: { $ne: req.params.id } });
      if (conflict) return res.status(409).json({ error: 'Another profile with this email already exists.' });
    }
    const profile = await UserProfile.findByIdAndUpdate(
      req.params.id,
      { name, email: normalizedEmail || email, preferredSubjects, avatar },
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — DELETE /api/profiles/:id (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || String(req.user.id) !== String(req.params.id)) return res.status(403).json({ error: 'Forbidden. You can only delete your own profile.' });
    const profile = await UserProfile.findByIdAndDelete(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    res.json({ message: 'Profile deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
