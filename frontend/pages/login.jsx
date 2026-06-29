import { useState, useEffect } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // AUTOMATIC REDIRECT: If they are already signed in, bypass this page and go straight to the dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/';
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Invalid email or password.');
      }

      // Secure authentication state local token assignment
      localStorage.setItem('token', data.token);
      
      // Clear path back into main dashboard workspace
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginContainer}>
      
      {/* LEFT SIDE: FORM SECTION */}
      <div style={styles.loginFormSection}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={styles.brandName}>BrainBytes.</div>
        </div>

        <div>
          <h1 style={styles.welcomeHeading}>Welcome to BrainBytes!</h1>
          <p style={styles.subText}>Empowering smarter learning, one byte at a time. Please sign in to continue your journey.</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ marginTop: '2rem' }}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
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

          <div style={styles.formOptions}>
            <label style={styles.rememberMe}>
              <input type="checkbox" style={{ accentColor: '#4f46e5', cursor: 'pointer' }} />
              Remember for 30 days
            </label>
            <a href="#" style={styles.forgotLink}>Forgot password</a>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={styles.signupPrompt}>
          Don't have an account?{' '}
          <a href="/register" style={styles.signupLink}>Sign up for free</a>
        </p>
      </div>

      {/* RIGHT SIDE: MODERN SPLIT DARK PANEL */}
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

// INLINE STYLING ARCHITECTURE
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
    marginTop: '1.5rem',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: '1.5rem',
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
  formOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    fontSize: '0.875rem',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4b5563',
    cursor: 'pointer',
  },
  forgotLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
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