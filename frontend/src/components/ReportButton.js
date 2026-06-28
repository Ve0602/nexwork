import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const REASONS = [
  ['spam', 'Spam'],
  ['scam_or_fraud', 'Scam or fraud'],
  ['inappropriate_content', 'Inappropriate content'],
  ['harassment', 'Harassment or abuse'],
  ['fake_profile', 'Fake profile'],
  ['not_as_described', 'Not as described'],
  ['other', 'Other'],
];

/**
 * Drop this on any user profile, project, service, or job listing.
 * Usage: <ReportButton targetType="user" targetId={profile._id} />
 */
export default function ReportButton({ targetType, targetId, label = 'Report' }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!token) return null; // reporting requires being logged in and identifiable

  const submit = async () => {
    if (!reason) { setError('Please choose a reason'); return; }
    setSubmitting(true); setError('');
    try {
      await axios.post(`${API}/api/reports`, { targetType, targetId, reason, details }, { headers: { Authorization: `Bearer ${token}` } });
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit report');
    } finally { setSubmitting(false); }
  };

  const reset = () => { setOpen(false); setReason(''); setDetails(''); setDone(false); setError(''); };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-ghost" style={{ color: 'var(--text-faint)', fontSize: 12 }}>
        {label}
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={reset} />
          <div className="card" style={{ position: 'relative', maxWidth: 420, width: '100%', padding: 24, zIndex: 1, background: 'var(--bg-raised)' }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Report submitted</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 18 }}>Our team will review this shortly.</p>
                <button onClick={reset} className="btn btn-secondary">Close</button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Report this {targetType}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>Reports are reviewed by our team. Misuse may affect your account.</p>

                {error && <div className="card" style={{ padding: '8px 12px', marginBottom: 12, fontSize: 12, color: 'var(--danger)' }}>{error}</div>}

                <label style={ls}>Reason</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {REASONS.map(([id, l]) => (
                    <button key={id} onClick={() => setReason(id)} className="tag" style={{ cursor: 'pointer', background: reason === id ? 'var(--danger-bg)' : 'var(--bg)', color: reason === id ? 'var(--danger)' : 'var(--text-muted)', border: `1px solid ${reason === id ? 'transparent' : 'var(--border)'}` }}>{l}</button>
                  ))}
                </div>

                <label style={ls}>Additional details (optional)</label>
                <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} placeholder="Anything that would help us review this…" className="input" style={{ resize: 'vertical', marginBottom: 16 }} />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={submit} disabled={submitting || !reason} className="btn btn-primary" style={{ flex: 1, opacity: !reason ? 0.5 : 1 }}>{submitting ? 'Submitting…' : 'Submit report'}</button>
                  <button onClick={reset} className="btn btn-secondary">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const ls = { display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' };
