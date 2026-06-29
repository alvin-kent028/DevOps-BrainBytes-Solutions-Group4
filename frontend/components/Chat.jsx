import { useState, useEffect } from 'react';
import ChatInput from './ChatInput';

const TABS = ['All', 'Math', 'Science', 'English', 'History', 'Programming', 'General'];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch saved messages on page load
  useEffect(() => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(() => console.error("Could not load history"));
  }, []);

  const handleSubmit = async (text) => {
    setLoading(true);
    setError('');

    // Optimistically put the user's message on screen instantly
    const tempUserMsg = { text, isUser: true, category: 'general', createdAt: new Date() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // 2. Point to the REAL AI endpoint, and pass the activeTab as the subject!
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          subject: activeTab === 'All' ? undefined : activeTab 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Tag both messages with the category the AI assigned them
        const finalUser = { ...data.userMessage, category: data.category };
        const finalAi = { ...data.aiMessage, category: data.category };

        // Replace our temporary user message with the official DB versions
        setMessages(prev => [...prev.slice(0, -1), finalUser, finalAi]);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Error: Unable to send message.');
    } finally {
      setLoading(false);
    }
  };

  // 3. The Filter Logic
  const visibleMessages = messages.filter(msg => {
    if (activeTab === 'All') return true;
    return msg.category?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="chat-container">
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ fontWeight: activeTab === tab ? 'bold' : 'normal' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Message Window */}
      <div className="message-history" style={{ minHeight: '300px' }}>
        {visibleMessages.map((m, index) => (
          <div key={index} style={{ textAlign: m.isUser ? 'right' : 'left', margin: '8px 0' }}>
            <p style={{ display: 'inline-block', padding: '8px', borderRadius: '8px', background: m.isUser ? '#d1e7dd' : '#f8f9fa' }}>
              {m.text}
            </p>
          </div>
        ))}
      </div>

      {loading && <div data-testid="loading-indicator">AI Tutor is thinking...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <ChatInput onSubmit={handleSubmit} />
    </div>
  );
}