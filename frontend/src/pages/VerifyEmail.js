import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); setMessage('No verification token found in this link.'); return; }

    axios.post(`${API}/api/auth/verify-email`, { token })
      .then(({ data }) => {
        setStatus('success');
        updateUser?.({ emailVerified: true });
      })
      .catch(e => {
        setStatus('error');
        setMessage(e.response?.data?.message || 'This link is invalid or has expired.');
      });
  }, [params]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: 32, textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Verifying your email…</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>One moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: 'var(--success)' }}>Email verified</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Your account is now fully verified.</p>
            <Link to="/dashboard" className="btn btn-primary">Go to dashboard</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: 'var(--danger)' }}>Verification failed</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{message}</p>
            <Link to="/dashboard" className="btn btn-secondary">Go to dashboard</Link>
          </>
        )}
      </div>
    </div>
  );
}
