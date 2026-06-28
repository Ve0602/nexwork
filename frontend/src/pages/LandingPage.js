import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STAT_DEFAULTS = [
  { label: 'Average pay', value: '₹500', suffix: '/hr' },
  { label: 'Roles created', value: '—' },
  { label: 'Paid to talent', value: '—' },
];

const CATEGORIES = [
  'AI & Machine Learning', 'Data Annotation', 'Web Development',
  'Content & Writing', 'Tailoring & Fashion', 'Photography',
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(STAT_DEFAULTS);
  const [roles, setRoles] = useState([]);
  const [activeCat, setActiveCat] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) { navigate('/dashboard'); return; }
    load();
  }, [user]);

  const load = async () => {
    try {
      const [projRes, jobsRes] = await Promise.all([
        axios.get(`${API}/api/projects?limit=8`),
        axios.get(`${API}/api/jobs?limit=8`),
      ]);
      const projects = projRes.data.projects || [];
      const jobs = jobsRes.data.jobs || [];

      const combined = [
        ...projects.map(p => ({
          id: p._id, title: p.title, type: 'project',
          rateLow: p.budget?.min, rateHigh: p.budget?.max,
          category: p.category, applicants: p.proposals?.length || 0,
          link: `/projects/${p._id}`,
        })),
        ...jobs.map(j => ({
          id: j._id, title: j.title, type: 'job',
          rateLow: j.salary?.min, rateHigh: j.salary?.max,
          category: j.type, applicants: j.applications?.length || 0,
          link: `/jobs`,
        })),
      ].sort(() => Math.random() - 0.5).slice(0, 8);

      setRoles(combined);

      const totalProjects = projRes.data.total || 0;
      const totalPaid = projects.reduce((sum, p) => sum + (p.totalPaid || 0), 0);
      setStats([
        STAT_DEFAULTS[0],
        { label: 'Roles created', value: totalProjects.toLocaleString() },
        { label: 'Paid to talent', value: totalPaid > 0 ? `₹${(totalPaid/100000).toFixed(1)}L` : '₹0' },
      ]);
    } catch (e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const filteredRoles = activeCat === 'All' ? roles : roles.filter(r => r.category === activeCat);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <TopNav stats={stats} />

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: 14 }}>
          Work that builds the AI economy
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
          NexWork connects India's technical and domain experts with AI labs, startups, and enterprises — plus a marketplace for local services in your city.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/onboarding?role=freelancer" className="btn btn-primary" style={{ padding: '11px 24px', fontSize: 14 }}>Find work</Link>
          <Link to="/onboarding?role=client" className="btn btn-secondary" style={{ padding: '11px 24px', fontSize: 14 }}>Hire talent</Link>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['All', ...CATEGORIES].map(c => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className="tag"
            style={{
              cursor: 'pointer', fontSize: 12, padding: '6px 14px',
              background: activeCat === c ? 'var(--accent-subtle)' : 'var(--bg)',
              color: activeCat === c ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${activeCat === c ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {c}
          </button>
        ))}
      </section>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '16px 24px 80px' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Latest roles</span>
            <Link to="/find-work" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading roles…</div>
          ) : filteredRoles.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No open roles in this category yet. <Link to="/post-project" style={{ color: 'var(--accent)' }}>Post one →</Link>
            </div>
          ) : (
            filteredRoles.map((r, i) => (
              <Link
                key={r.id}
                to={r.link}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 20px', borderBottom: i < filteredRoles.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {r.category}{r.applicants > 0 && ` · ${r.applicants} applied`}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 16 }}>
                  {r.rateLow ? (
                    <div className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>
                      ₹{r.rateLow.toLocaleString()}–{r.rateHigh?.toLocaleString()}
                    </div>
                  ) : <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Budget TBD</div>}
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>Apply →</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--border)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 28, textAlign: 'center' }}>
            How it works
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
            {[
              ['01', 'Create a profile', 'Add your skills, set your rate, and choose what kind of work you want — remote AI gigs or local services.'],
              ['02', 'Find or post work', 'Browse open roles and apply, or post a project and review proposals from real, ranked applicants.'],
              ['03', 'Get paid securely', 'Payments sit in escrow until you approve delivered work. NexWork takes a flat 10% — shown upfront, every time.'],
            ].map(([num, title, desc]) => (
              <div key={num}>
                <div className="mono" style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 10 }}>{num}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto', flexWrap: 'wrap', gap: 12 }}>
        <span className="mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>NexWork</span>
        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>© 2026 · Warangal, India</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/privacy" style={{ fontSize: 12, color: 'var(--text-faint)' }}>Privacy</Link>
          <Link to="/terms" style={{ fontSize: 12, color: 'var(--text-faint)' }}>Terms</Link>
        </div>
      </footer>
    </div>
  );
}
