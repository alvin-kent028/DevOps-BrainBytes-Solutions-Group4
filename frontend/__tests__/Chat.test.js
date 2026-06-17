import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chat from '../components/Chat'; // Assumed component layout

test('shows loading indicator while waiting for response', async () => {
  // Mock fetch to delay response
  fetch.mockImplementationOnce(() => new Promise(resolve => {
    setTimeout(() => {
      resolve({
        json: () => Promise.resolve({
          userMessage: { text: 'Hello' },
          aiMessage: { text: 'Hi there' }
        })
      });
    }, 100);
  }));

  render(<Chat />);

  // Type and submit a message
  const input = screen.getByPlaceholderText(/type your question/i);
  fireEvent.change(input, { target: { value: 'Hello' } });
  const button = screen.getByRole('button', { name: /send/i });
  fireEvent.click(button);

  // Check for loading indicator
  expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

  // Wait for response
  await waitFor(() => {
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });
});

test('shows error message when API call fails', async () => {
  // Mock fetch to reject
  fetch.mockRejectedValueOnce(new Error('Network error'));

  render(<Chat />);

  // Type and submit a message
  const input = screen.getByPlaceholderText(/type your question/i);
  fireEvent.change(input, { target: { value: 'Hello' } });
  const button = screen.getByRole('button', { name: /send/i });
  fireEvent.click(button);

  // Check for error message
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});