// backend/routes/activityLogRoutes.js
const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');

// GET recent activity for a user — GET /api/activity/:userId
router.get('/:userId', async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET activity stats for a user — GET /api/activity/:userId/stats
router.get('/:userId/stats', async (req, res) => {
  try {
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
