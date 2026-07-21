import { useState } from 'react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedUser = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUser || !trimmedEmail || !trimmedPassword) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
try {
  // Uses environment variable in production, falls back to local backend
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username: trimmedUser, 
      name: trimmedUser, // Backing up both property names to prevent "Name required" errors
      email: trimmedEmail, 
      password: trimmedPassword 
    }),
  });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed.');
      }

      setSuccess('Account created successfully! Forwarding to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginContainer}>
      
      {/* LEFT SIDE: INLINE REGISTER FORM */}
      <div style={styles.loginFormSection}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={styles.brandName}>BrainBytes.</div>
        </div>

        <div>
          <h1 style={styles.welcomeHeading}>Create Account</h1>
          <p style={styles.subText}>Join BrainBytes and start your learning journey today.</p>
        </div>

        {error && <div style={styles.errorAlert}>⚠️ {error}</div>}
        {success && <div style={styles.successAlert}>🎉 {success}</div>}

        <form onSubmit={handleRegister} style={{ marginTop: '1.5rem' }}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Your username"
              style={styles.inputField}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              style={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              style={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.signupPrompt}>
          Already have an account?{' '}
          <a href="/login" style={styles.signupLink}>Log In</a>
        </p>
      </div>

      {/* RIGHT SIDE: CONTINUOUS DEEP DARK PANEL */}
      <div style={styles.loginImageSection}>
        <div style={styles.graphicCard}>
          <h2 style={styles.graphicHeading}>Expand your mind, byte by byte.</h2>
          <p style={styles.graphicDesc}>
            Access high-yield DevOps training tracking systems, build cloud architectures seamlessly, and monitor automation clusters with your tech squad instantly.
          </p>
        </div>
      </div>

    </div>
  );
}

// INLINE STYLES FOR ZERO-DEPENDENCY RENDERING
const styles = {
  loginContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#ffffff',
    margin: 0,
    padding: 0,
  },
  loginFormSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '3rem 4rem',
    maxWidth: '500px',
    width: '100%',
  },
  brandName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#4f46e5',
    letterSpacing: '-0.05em',
  },
  welcomeHeading: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '0.5rem',
    letterSpacing: '-0.03em',
  },
  subText: {
    color: '#6b7280',
    fontSize: '0.95rem',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    borderLeft: '4px solid #ef4444',
    padding: '1rem',
    borderRadius: '6px',
    color: '#991b1b',
    fontSize: '0.875rem',
    marginTop: '1rem',
    fontWeight: '500',
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    borderLeft: '4px solid #22c55e',
    padding: '1rem',
    borderRadius: '6px',
    color: '#166534',
    fontSize: '0.875rem',
    marginTop: '1rem',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  inputField: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#111827',
    boxSizing: 'border-box',
    outline: 'none',
  },
  submitBtn: {
    width: '100%',
    padding: '0.85rem',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  signupPrompt: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#6b7280',
    marginTop: '1.5rem',
  },
  signupLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600',
  },
  loginImageSection: {
    flex: 1.2,
    backgroundColor: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
  },
  graphicCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '3rem',
    borderRadius: '24px',
    maxWidth: '500px',
    color: 'white',
  },
  graphicHeading: {
    fontSize: '2.5rem',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '1.5rem',
    color: '#ffffff',
  },
  graphicDesc: {
    color: '#9ca3af',
    lineHeight: '1.6',
    fontSize: '1.05rem',
  },
};