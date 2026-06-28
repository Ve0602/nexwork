import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TopNav from '../components/TopNav';
import Skeleton from '../components/Skeleton';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ROLES = ['All','freelancer','service_provider','mentor','trainer','professional'];
const ROLE_LABELS = { freelancer:'Freelancer', service_provider:'Service provider', mentor:'Mentor', trainer:'Trainer', professional:'Professional' };
const SKILLS = ['Python','JavaScript','React','AI/ML','Prompt Engineering','Data Annotation','Graphic Design','Node.js','Content Writing','Tailoring','Photography'];

export default function FindTalent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { loadTalent(); }, [page, role, skill]);

  const loadTalent = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 12 });
      if (role && role !== 'All') q.set('role', role);
      if (skill) q.set('skill', skill);
      if (search) q.set('search', search);
      if (location) q.set('location', location);
      const { data } = await axios.get(`${API}/api/users/search?${q}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Find talent</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} professionals</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, maxWidth: 700 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter' && loadTalent()} placeholder="Search by name, skill, or headline…" className="input" />
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="input" style={{ maxWidth: 160 }} />
          <button onClick={loadTalent} className="btn btn-primary">Search</button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {ROLES.map(r => (
            <button key={r} onClick={() => { setRole(r==='All'?'':r); setPage(1); }} className="tag" style={{ cursor:'pointer', background: (role===r||(r==='All'&&!role)) ? 'var(--accent-subtle)' : 'var(--bg)', color: (role===r||(r==='All'&&!role)) ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${(role===r||(r==='All'&&!role)) ? 'transparent' : 'var(--border)'}` }}>{r==='All'?'All roles':ROLE_LABELS[r]}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>

          <div>
            <div className="card" style={{ padding: 16, marginBottom: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Skill</h3>
              <select value={skill} onChange={e => setSkill(e.target.value)} className="input">
                <option value="">Any skill</option>
                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="card" style={{ padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>Need help on a project?</p>
              <Link to="/post-project" className="btn btn-primary" style={{ width: '100%' }}>Post project</Link>
            </div>
          </div>

          <div>
            {loading ? <Skeleton.List count={5} />
            : users.length===0 ? <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontSize:13 }}>No talent found. Try different filters.</div>
            : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {users.map(u => (
                    <div key={u._id} className="card card-interactive" style={{ padding: 18, position: 'relative' }}>
                      {u.isVerified && <span className="tag tag-success" style={{ position:'absolute', top:14, right:14 }}>Verified</span>}
                      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        {u.photo
                          ? <img src={u.photo} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          : <div className="mono" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, flexShrink: 0 }}>{u.name?.[0]?.toUpperCase()}</div>
                        }
                        <div style={{ minWidth: 0 }}>
                          <Link to={`/talent/${u._id}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'block' }}>{u.name}</Link>
                          <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 2 }}>{ROLE_LABELS[u.primaryRole]||u.primaryRole}</div>
                          {u.city && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{u.city}</div>}
                        </div>
                      </div>

                      {u.headline && <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{u.headline}</p>}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                        {(u.skills||[]).slice(0,4).map(s => <span key={s.name} className="tag">{s.name}</span>)}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 14 }}>
                          {u.rating > 0 && <div><div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>★ {u.rating}</div><div style={{ fontSize: 10, color: 'var(--text-faint)' }}>{u.reviewCount} reviews</div></div>}
                          {u.hourlyRate > 0 && <div><div className="mono" style={{ fontSize: 13, color: 'var(--success)' }}>₹{u.hourlyRate}/hr</div><div style={{ fontSize: 10, color: 'var(--text-faint)' }}>Rate</div></div>}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link to={`/talent/${u._id}`} className="btn btn-secondary">View</Link>
                          <Link to={`/messages?to=${u._id}`} className="btn btn-primary">Hire</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {total > 12 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                    {page > 1 && <button onClick={() => setPage(p=>p-1)} className="btn btn-secondary">← Prev</button>}
                    <span style={{ padding: '9px 16px', color: 'var(--text-muted)', fontSize: 13 }}>Page {page} of {Math.ceil(total/12)}</span>
                    {page < Math.ceil(total/12) && <button onClick={() => setPage(p=>p+1)} className="btn btn-secondary">Next →</button>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
