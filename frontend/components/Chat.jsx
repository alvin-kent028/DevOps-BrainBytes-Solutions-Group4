import { useState } from 'react';
import ChatInput from './ChatInput';

export default function Chat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (message) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      await response.json();
    } catch (err) {
      setError('Error: Unable to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ChatInput onSubmit={handleSubmit} />
      {loading && <div data-testid="loading-indicator">Loading...</div>}
      {error && <div>{error}</div>}
    </div>
  );
}