// frontend/src/components/SubjectFilter.jsx
import React from 'react';

const SUBJECTS = ['All', 'Math', 'Science', 'English', 'History', 'Programming', 'General'];

export default function SubjectFilter({ activeSubject, onSubjectChange }) {
  return (
    <div
      className="subject-filter"
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        padding: '12px 0',
        borderBottom: '1px solid #eee',
        marginBottom: 12,
      }}
    >
      {SUBJECTS.map((subject) => (
        <button
          key={subject}
          onClick={() => onSubjectChange(subject === 'All' ? null : subject)}
          style={{
            padding: '5px 14px',
            borderRadius: 20,
            border: '2px solid #4a90e2',
            backgroundColor: activeSubject === (subject === 'All' ? null : subject)
              ? '#4a90e2'
              : 'white',
            color: activeSubject === (subject === 'All' ? null : subject)
              ? 'white'
              : '#4a90e2',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {subject}
        </button>
      ))}
    </div>
  );
}
