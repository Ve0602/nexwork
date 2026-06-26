import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { label: 'Roles', to: '/find-work' },
  { label: 'Talent', to: '/find-talent' },
  { label: 'Services', to: '/services' },
  { label: 'Jobs', to: '/jobs' },
];

export default function TopNav({ stats }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>

      {/* Live stats ticker — only shown to logged-out visitors, the signature trust element */}
      {!user && stats && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ flex: 1, padding: '10px 24px', borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                {s.value}{s.suffix && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{s.suffix}</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, maxWidth: 1200, margin: '0 auto' }}>
        <Link to="/" className="mono" style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          NexWork
        </Link>

        <nav style={{ display: 'flex', gap: 24 }}>
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/notifications" className="btn btn-ghost" style={{ padding: 8 }} aria-label="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              </Link>
              <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-ghost">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/onboarding" className="btn btn-primary">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
