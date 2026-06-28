import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ROLE_LABELS = { freelancer:'Freelancer', client:'Client', student:'Student', jobseeker:'Job seeker', service_provider:'Service provider', mentor:'Mentor', trainer:'Trainer', recruiter:'Recruiter', professional:'Professional', admin:'Admin' };

const QUICK_LINKS = {
  freelancer:       [['Browse projects','/find-work'],['My proposals','/my-projects'],['AI proposal writer','/ai-tools/proposal'],['Earnings','/earnings']],
  client:           [['Post a project','/post-project'],['Find talent','/find-talent'],['My projects','/my-projects'],['Messages','/messages']],
  student:          [['Browse courses','/learn'],['AI career coach','/ai-tools/career'],['AI resume builder','/ai-tools/resume'],['Interview prep','/ai-tools/interview']],
  jobseeker:        [['Browse jobs','/jobs'],['AI resume builder','/ai-tools/resume'],['Mock interview','/ai-tools/interview'],['Skill analysis','/ai-tools/skills']],
  service_provider: [['Create a service','/create-service'],['My services','/my-services'],['Orders','/my-orders'],['Reviews','/my-reviews']],
  mentor:           [['Create a course','/create-course'],['My students','/my-students'],['Sessions','/sessions'],['Earnings','/earnings']],
  recruiter:        [['Post a job','/post-job'],['Candidates','/candidates'],['AI matching','/ai-tools/match'],['Analytics','/recruiter-analytics']],
  admin:            [['Admin panel','/admin'],['All users','/admin'],['All orders','/admin'],['Settings','/admin']],
};

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs]         = useState([]);
  const [notifs, setNotifs]     = useState([]);
  const [aiTip, setAiTip]       = useState('');
  const [loadingTip, setLoadingTip] = useState(false);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user) return navigate('/login');
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      const [pRes, jRes, nRes] = await Promise.all([
        axios.get(`${API}/api/projects?limit=4`),
        axios.get(`${API}/api/jobs?limit=4`),
        axios.get(`${API}/api/notifications`, { headers: h }).catch(() => ({ data: [] })),
      ]);
      setProjects(pRes.data.projects || []);
      setJobs(jRes.data.jobs || []);
      setNotifs(nRes.data || []);
    } catch (e) { console.log('Dashboard load error:', e.message); }
  };

  const getAITip = async () => {
    setLoadingTip(true);
    try {
      const { data } = await axios.post(`${API}/api/ai/career-coach`,
        { question: `Give me one specific, actionable tip to grow as a ${user.primaryRole} with skills: ${(user.skills||[]).map(s=>s.name).join(', ')}. Keep it under 3 sentences.`, userProfile: user },
        { headers: h }
      );
      setAiTip(data.answer);
    } catch (e) { setAiTip('Keep building your skills and stay consistent — most outcomes compound slowly, then quickly.'); }
    finally { setLoadingTip(false); }
  };

  if (!user) return null;

  const links = QUICK_LINKS[user.primaryRole] || QUICK_LINKS.freelancer;
  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <TopNav />

      {user.emailVerified === false && <EmailVerifyBanner />}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ padding: 20, marginBottom: 16, textAlign: 'center' }}>
              {user.photo
                ? <img src={user.photo} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
                : <div className="mono" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, margin: '0 auto 12px' }}>{user.name?.[0]?.toUpperCase()}</div>
              }
              <div style={{ fontSize: 15, fontWeight: 600 }}>{user.name}</div>
              <div className="tag tag-accent" style={{ display: 'inline-block', marginTop: 8, marginBottom: 8 }}>{ROLE_LABELS[user.primaryRole] || user.primaryRole}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{user.headline || 'Complete your profile'}</div>
              {user.city && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>{user.city}</div>}

              <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center' }}><div className="mono" style={{ fontSize: 15, fontWeight: 600 }}>{user.rating || 0}</div><div style={{ fontSize: 10, color: 'var(--text-faint)' }}>Rating</div></div>
                <div style={{ textAlign: 'center' }}><div className="mono" style={{ fontSize: 15, fontWeight: 600 }}>{user.totalJobs || 0}</div><div style={{ fontSize: 10, color: 'var(--text-faint)' }}>Jobs</div></div>
                <div style={{ textAlign: 'center' }}><div className="mono" style={{ fontSize: 15, fontWeight: 600 }}>{(user.skills||[]).length}</div><div style={{ fontSize: 10, color: 'var(--text-faint)' }}>Skills</div></div>
              </div>

              <Link to="/profile/edit" className="btn btn-secondary" style={{ display: 'block', marginTop: 14, width: '100%' }}>Edit profile</Link>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, padding: '0 6px' }}>Quick links</div>
              {links.map(([label, path]) => (
                <Link key={label} to={path} style={{ display: 'block', padding: '9px 10px', borderRadius: 6, fontSize: 13, color: 'var(--text-muted)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Main */}
          <div>
            <div className="card" style={{ padding: '20px 22px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: 19, fontWeight: 600, marginBottom: 4 }}>Welcome back, {user.name?.split(' ')[0]}</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {user.availability === 'available' ? 'You are marked available for work' : 'You are currently unavailable'}
                  {user.plan !== 'free' && ` · ${user.plan} plan`}
                  {unreadCount > 0 && <> · <Link to="/notifications" style={{ color: 'var(--accent)' }}>{unreadCount} unread notification{unreadCount>1?'s':''}</Link></>}
                </p>
                {aiTip && <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 480, padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 500 }}>AI tip:</span> {aiTip}
                </div>}
              </div>
              <button onClick={getAITip} disabled={loadingTip} className="btn btn-secondary" style={{ flexShrink: 0 }}>
                {loadingTip ? 'Thinking…' : 'Get an AI tip'}
              </button>
            </div>

            {(user.skills||[]).length > 0 && (
              <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>Your skills</h3>
                  <Link to="/profile/edit" style={{ fontSize: 12, color: 'var(--text-faint)' }}>Add more</Link>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {user.skills.map(s => (
                    <span key={s.name} className={`tag ${s.verified ? 'tag-accent' : ''}`}>{s.name}{s.verified && ' ✓'}</span>
                  ))}
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>Open projects</h3>
                  <Link to="/find-work" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {projects.slice(0,3).map(p => (
                    <Link key={p._id} to={`/projects/${p._id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.category} · {p.duration || 'Flexible'}</div>
                      </div>
                      {p.budget && <div className="mono" style={{ fontSize: 13, color: 'var(--text)', flexShrink: 0 }}>₹{p.budget.min}–{p.budget.max}</div>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {jobs.length > 0 && (
              <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>Latest jobs</h3>
                  <Link to="/jobs" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {jobs.slice(0,3).map(j => (
                    <Link key={j._id} to="/jobs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{j.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{j.company} · {j.mode} · {j.type}</div>
                      </div>
                      {j.salary && <div className="mono" style={{ fontSize: 12, color: 'var(--success)', flexShrink: 0 }}>₹{j.salary.min?.toLocaleString()}–{j.salary.max?.toLocaleString()}/mo</div>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="card" style={{ padding: '18px 20px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>AI tools</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {[['Interview prep','/ai-tools/interview'],['Resume builder','/ai-tools/resume'],['Career coach','/ai-tools/career'],['Skill analysis','/ai-tools/skills'],['Proposal writer','/ai-tools/proposal'],['Job matcher','/ai-tools/match']].map(([label, path]) => (
                  <Link key={label} to={path} style={{ textAlign: 'center', padding: '14px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, fontWeight: 500, color: 'var(--text)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailVerifyBanner() {
  const { token } = useAuth();
  const [status, setStatus] = useState(''); // '', 'sending', 'sent', 'error'

  const resend = async () => {
    setStatus('sending');
    try {
      await axios.post(`${API}/api/auth/resend-verification`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setStatus('sent');
    } catch (e) { setStatus('error'); }
  };

  return (
    <div style={{ background: 'var(--warning-bg)', borderBottom: '1px solid var(--border)', padding: '10px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: 'var(--warning)' }}>
        {status === 'sent' ? 'Verification email sent — check your inbox.' : 'Please verify your email to unlock all features.'}
      </span>
      {status !== 'sent' && (
        <button onClick={resend} disabled={status === 'sending'} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>
          {status === 'sending' ? 'Sending…' : status === 'error' ? 'Failed — try again' : 'Resend email'}
        </button>
      )}
    </div>
  );
}
