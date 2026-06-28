import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';
import Skeleton from '../components/Skeleton';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const JOB_TYPES = ['All','fulltime','parttime','contract','internship','freelance'];
const JOB_MODES = ['All','remote','onsite','hybrid'];

export default function JobsPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [mode, setMode] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);
  const [appForm, setAppForm] = useState({ coverLetter:'', resumeUrl:'' });
  const [msg, setMsg] = useState('');

  useEffect(() => { loadJobs(); }, [page, type, mode]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit:12 });
      if (type && type !== 'All') q.set('type', type);
      if (mode && mode !== 'All') q.set('mode', mode);
      if (search) q.set('search', search);
      const { data } = await axios.get(`${API}/api/jobs?${q}`);
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
    } catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const applyJob = async () => {
    if (!token) return setMsg('Please log in to apply');
    setApplying(true);
    try {
      await axios.post(`${API}/api/jobs/${selected._id}/apply`, appForm, { headers:{ Authorization:`Bearer ${token}` } });
      setMsg('Application submitted.');
      setSelected(null);
      setAppForm({ coverLetter:'', resumeUrl:'' });
    } catch(e) { setMsg(e.response?.data?.message || 'Application failed'); }
    finally { setApplying(false); }
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Find jobs</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} openings</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, maxWidth: 600 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loadJobs()} placeholder="Search jobs by title or company…" className="input" />
          <button onClick={loadJobs} className="btn btn-primary">Search</button>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Type</span>
            {JOB_TYPES.map(t => <button key={t} onClick={()=>{setType(t==='All'?'':t);setPage(1);}} className="tag" style={{ cursor:'pointer', textTransform:'capitalize', background:(type===t||(t==='All'&&!type))?'var(--accent-subtle)':'var(--bg)', color:(type===t||(t==='All'&&!type))?'var(--accent)':'var(--text-muted)', border:`1px solid ${(type===t||(t==='All'&&!type))?'transparent':'var(--border)'}` }}>{t}</button>)}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Mode</span>
            {JOB_MODES.map(m => <button key={m} onClick={()=>{setMode(m==='All'?'':m);setPage(1);}} className="tag" style={{ cursor:'pointer', textTransform:'capitalize', background:(mode===m||(m==='All'&&!mode))?'var(--accent-subtle)':'var(--bg)', color:(mode===m||(m==='All'&&!mode))?'var(--accent)':'var(--text-muted)', border:`1px solid ${(mode===m||(m==='All'&&!mode))?'transparent':'var(--border)'}` }}>{m}</button>)}
          </div>
        </div>

        {msg && <div className="card" style={{ padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>{msg}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 0 }}>
          <div style={{ paddingRight: 24, borderRight: '1px solid var(--border)' }}>
            {loading ? <Skeleton.List count={5} />
            : jobs.length===0 ? <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontSize:13 }}>No jobs found.</div>
            : (
              <div style={{ display: 'grid', gap: 10 }}>
                {jobs.map(j => (
                  <div key={j._id} onClick={() => setSelected(j)} className="card card-interactive" style={{ padding: '16px 18px', cursor: 'pointer', borderColor: selected?._id===j._id ? 'var(--accent)' : 'var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                          {j.type && <span className="tag tag-accent" style={{ textTransform: 'capitalize' }}>{j.type}</span>}
                          {j.mode && <span className="tag" style={{ textTransform: 'capitalize' }}>{j.mode}</span>}
                          {j.isVerified && <span className="tag tag-success">Verified</span>}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{j.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{j.company}{j.location && ` · ${j.location}`}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {j.salary && <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>₹{j.salary.min?.toLocaleString()}–{j.salary.max?.toLocaleString()}</div>}
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>{j.applications?.length||0} applied</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ paddingLeft: 24 }}>
            {selected ? (
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  {selected.type && <span className="tag tag-accent" style={{ textTransform: 'capitalize' }}>{selected.type}</span>}
                  {selected.mode && <span className="tag" style={{ textTransform: 'capitalize' }}>{selected.mode}</span>}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{selected.title}</h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{selected.company}{selected.location && ` · ${selected.location}`}</div>

                {selected.salary && (
                  <div className="card" style={{ padding: '12px 16px', marginBottom: 16, background: 'var(--bg-subtle)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 2 }}>Salary</div>
                    <div className="mono" style={{ fontWeight: 600, fontSize: 17 }}>₹{selected.salary.min?.toLocaleString()}–₹{selected.salary.max?.toLocaleString()}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}> /{selected.salary.period||'mo'}</span></div>
                  </div>
                )}

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Description</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7 }}>{selected.description}</p>
                </div>

                {(selected.skills||[]).length>0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Required skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{selected.skills.map(s=><span key={s} className="tag">{s}</span>)}</div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Apply</h3>
                  <textarea value={appForm.coverLetter} onChange={e=>setAppForm({...appForm,coverLetter:e.target.value})} rows={4} placeholder="Brief cover letter…" className="input" style={{ resize:'vertical', marginBottom: 10 }} />
                  <input value={appForm.resumeUrl} onChange={e=>setAppForm({...appForm,resumeUrl:e.target.value})} placeholder="Resume URL" className="input" style={{ marginBottom: 12 }} />
                  <button onClick={applyJob} disabled={applying} className="btn btn-primary" style={{ width: '100%' }}>{applying?'Applying…':'Apply now'}</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-faint)', fontSize: 13 }}>Select a job to see details</div>
            )}
          </div>
        </div>

        {total > 12 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {page > 1 && <button onClick={() => setPage(p=>p-1)} className="btn btn-secondary">← Prev</button>}
            <span style={{ padding: '9px 16px', color: 'var(--text-muted)', fontSize: 13 }}>Page {page} of {Math.ceil(total/12)}</span>
            {page < Math.ceil(total/12) && <button onClick={() => setPage(p=>p+1)} className="btn btn-secondary">Next →</button>}
          </div>
        )}
      </div>
    </div>
  );
}
