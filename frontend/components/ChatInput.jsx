import { useState } from 'react';

export default function ChatInput({ onSubmit }) {
  const [value, setValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Type your question"
        aria-label="Type your question"
      />
      <button type="submit">Send</button>
    </form>
  );
}