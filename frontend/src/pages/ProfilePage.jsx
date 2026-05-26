// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Programming', 'General'];

export default function ProfilePage({ userId, onProfileSaved }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    preferredSubjects: [],
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (userId) {
      setIsEdit(true);
      axios.get(`/api/profiles/${userId}`)
        .then((res) => setForm(res.data))
        .catch(() => setMessage('Could not load profile.'));
    }
  }, [userId]);

  const toggleSubject = (subject) => {
    setForm((prev) => ({
      ...prev,
      preferredSubjects: prev.preferredSubjects.includes(subject)
        ? prev.preferredSubjects.filter((s) => s !== subject)
        : [...prev.preferredSubjects, subject],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      let res;
      if (isEdit) {
        res = await axios.put(`/api/profiles/${userId}`, form);
      } else {
        res = await axios.post('/api/profiles', form);
      }
      setMessage('Profile saved successfully! ✅');
      if (onProfileSaved) onProfileSaved(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page" style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
      <h2>{isEdit ? 'Edit Profile' : 'Create Profile'}</h2>

      {message && (
        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="name"><strong>Name</strong></label>
          <input
            id="name"
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        <div>
          <label htmlFor="email"><strong>Email</strong></label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        <div>
          <label><strong>Preferred Subjects</strong></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {SUBJECTS.map((subject) => (
              <button
                type="button"
                key={subject}
                onClick={() => toggleSubject(subject)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: '2px solid #4a90e2',
                  backgroundColor: form.preferredSubjects.includes(subject) ? '#4a90e2' : 'white',
                  color: form.preferredSubjects.includes(subject) ? 'white' : '#4a90e2',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 0',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}
