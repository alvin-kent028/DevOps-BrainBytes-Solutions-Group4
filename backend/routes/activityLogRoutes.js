// backend/routes/activityLogRoutes.js
const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');

// GET recent activity for a user — GET /api/activity/:userId
router.get('/:userId', auth, async (req, res) => {
  try {
    if (!req.user || String(req.user.id) !== String(req.params.userId)) return res.status(403).json({ error: 'Forbidden. You can only access your own activity.' });
    const logs = await ActivityLog.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET activity stats for a user — GET /api/activity/:userId/stats
router.get('/:userId/stats', auth, async (req, res) => {
  try {
    if (!req.user || String(req.user.id) !== String(req.params.userId)) return res.status(403).json({ error: 'Forbidden. You can only access your own activity stats.' });
    const logs = await ActivityLog.find({ userId: req.params.userId });

    const subjectCount = {};
    logs.forEach((log) => {
      subjectCount[log.subject] = (subjectCount[log.subject] || 0) + 1;
    });

    const avgSentiment =
      logs.length > 0
        ? logs.reduce((sum, l) => sum + l.sentimentScore, 0) / logs.length
        : 0;

    res.json({
      totalSessions: logs.length,
      subjectBreakdown: subjectCount,
      averageSentiment: avgSentiment.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
