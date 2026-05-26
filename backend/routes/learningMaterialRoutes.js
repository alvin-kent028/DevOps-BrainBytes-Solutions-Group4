// backend/routes/learningMaterialRoutes.js
const express = require('express');
const router = express.Router();
const LearningMaterial = require('../models/LearningMaterial');

// CREATE — POST /api/materials
router.post('/', async (req, res) => {
  try {
    const { subject, topic, content, contentType, tags, createdBy } = req.body;
    const material = new LearningMaterial({ subject, topic, content, contentType, tags, createdBy });
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL — GET /api/materials
// Optional query params: ?subject=Math&contentType=definition
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.contentType) filter.contentType = req.query.contentType;
    if (req.query.topic) filter.topic = { $regex: req.query.topic, $options: 'i' };

    const materials = await LearningMaterial.find(filter).sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE — GET /api/materials/:id
router.get('/:id', async (req, res) => {
  try {
    const material = await LearningMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found.' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE — PUT /api/materials/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await LearningMaterial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Material not found.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — DELETE /api/materials/:id
router.delete('/:id', async (req, res) => {
  try {
    const material = await LearningMaterial.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found.' });
    res.json({ message: 'Material deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
