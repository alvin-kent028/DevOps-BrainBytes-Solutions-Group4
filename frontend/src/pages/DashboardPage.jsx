// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DashboardPage({ userId }) {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      axios.get(`/api/activity/${userId}/stats`),
      axios.get(`/api/activity/${userId}`),
    ])
      .then(([statsRes, activityRes]) => {
        setStats(statsRes.data);
        setRecentActivity(activityRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) {
    return (
      <div style={{ padding: 24 }}>
        <p>Please create or select a profile to see your dashboard.</p>
      </div>
    );
  }

  if (loading) return <p style={{ padding: 24 }}>Loading dashboard...</p>;

  const sentimentLabel = (score) => {
    if (score >= 0.3) return '😊 Positive';
    if (score <= -0.3) return '😣 Needs encouragement';
    return '😐 Neutral';
  };

  return (
    <div className="dashboard-page" style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h2>📊 Learning Dashboard</h2>

      {stats && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <StatCard title="Total Sessions" value={stats.totalSessions} color="#4a90e2" />
          <StatCard title="Mood" value={sentimentLabel(parseFloat(stats.averageSentiment))} color="#7b68ee" />
          {Object.entries(stats.subjectBreakdown).map(([subject, count]) => (
            <StatCard key={subject} title={subject} value={`${count} session${count > 1 ? 's' : ''}`} color="#2ecc71" />
          ))}
        </div>
      )}

      <h3>📝 Recent Activity</h3>
      {recentActivity.length === 0 ? (
        <p style={{ color: '#888' }}>No activity yet. Start chatting to learn!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recentActivity.map((log) => (
            <div
              key={log._id}
              style={{
                padding: 14,
                border: '1px solid #e0e0e0',
                borderRadius: 10,
                backgroundColor: '#f9f9f9',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: '#4a90e2' }}>{log.subject}</span>
                <span style={{ fontSize: 12, color: '#aaa' }}>
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: 0, fontWeight: 600 }}>Q: {log.question}</p>
              <p style={{ margin: '6px 0 0', color: '#555', fontSize: 14 }}>
                {log.response.slice(0, 120)}{log.response.length > 120 ? '...' : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        flex: '1 1 140px',
        padding: 16,
        borderRadius: 12,
        backgroundColor: color,
        color: 'white',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
