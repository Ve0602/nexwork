import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CATEGORIES = ['All','AI & Machine Learning','Web Development','Data Science','Design & Creative','Content Writing','Tailoring & Fashion','Home Services','Photography','Teaching','Mobile Development','Other'];
const BUDGETS = [{label:'Any budget',value:''},{label:'Under ₹5,000',value:'0-5000'},{label:'₹5,000–25,000',value:'5000-25000'},{label:'₹25,000–1,00,000',value:'25000-100000'},{label:'₹1,00,000+',value:'100000-999999'}];

export default function FindWork() {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(params.get('category') || '');
  const [budget, setBudget] = useState('');
  const [showProposal, setShowProposal] = useState(null);
  const [proposal, setProposal] = useState({ coverLetter:'', bid:'', duration:'' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadProjects(); }, [page, category, budget]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit:12 });
      if (category && category !== 'All') q.set('category', category);
      if (search) q.set('search', search);
      const { data } = await axios.get(`${API}/api/projects?${q}`);
      setProjects(data.projects || []);
      setTotal(data.total || 0);
    } catch (e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const submitProposal = async () => {
    if (!token) return setMsg('Please log in to submit a proposal');
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/projects/${showProposal._id}/proposals`, proposal, { headers:{ Authorization:`Bearer ${token}` } });
      setMsg('Proposal submitted.');
      setShowProposal(null);
      setProposal({ coverLetter:'', bid:'', duration:'' });
    } catch (e) { setMsg(e.response?.data?.message || 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Find work</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} open projects</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, maxWidth: 600 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter' && loadProjects()} placeholder="Search projects…" className="input" />
          <button onClick={loadProjects} className="btn btn-primary">Search</button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c==='All'?'':c); setPage(1); }} className="tag" style={{ cursor:'pointer', background: (category===c||(c==='All'&&!category)) ? 'var(--accent-subtle)' : 'var(--bg)', color: (category===c||(c==='All'&&!category)) ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${(category===c||(c==='All'&&!category)) ? 'transparent' : 'var(--border)'}` }}>{c}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ padding: 16, marginBottom: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Budget</h3>
              {BUDGETS.map(b => (
                <div key={b.label} onClick={() => setBudget(b.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 13, height: 13, borderRadius: '50%', border: `1.5px solid ${budget===b.value ? 'var(--accent)' : 'var(--border-strong)'}`, background: budget===b.value ? 'var(--accent)' : 'transparent', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: budget===b.value ? 'var(--text)' : 'var(--text-muted)' }}>{b.label}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>Have a project to post?</p>
              <Link to="/post-project" className="btn btn-primary" style={{ width: '100%' }}>Post project</Link>
            </div>
          </div>

          {/* List */}
          <div>
            {msg && <div className="card" style={{ padding: '10px 14px', marginBottom: 16, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>{msg}<button onClick={()=>setMsg('')} className="btn btn-ghost" style={{ padding: 0 }}>✕</button></div>}

            {loading ? <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontSize:13 }}>Loading projects…</div>
            : projects.length===0 ? <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontSize:13 }}>No projects found. Try different keywords.</div>
            : (
              <>
                <div style={{ display: 'grid', gap: 12 }}>
                  {projects.map(p => (
                    <div key={p._id} className="card" style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className="tag tag-accent">{p.category}</span>
                            {p.duration && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{p.duration}</span>}
                            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                          </div>
                          <Link to={`/projects/${p._id}`} style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>{p.title}</Link>
                          <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{p.description?.substring(0,160)}{p.description?.length>160?'…':''}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {(p.skills||[]).map(s => <span key={s} className="tag">{s}</span>)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {p.budget && <div className="mono" style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>₹{p.budget.min?.toLocaleString()}–₹{p.budget.max?.toLocaleString()}</div>}
                          <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 10 }}>{p.proposals?.length||0} proposals</div>
                          <button onClick={() => setShowProposal(p)} className="btn btn-primary" style={{ marginBottom: 6, display:'block', width:'100%' }}>Submit proposal</button>
                          <Link to={`/projects/${p._id}`} style={{ display: 'block', textAlign: 'center', fontSize: 12, color: 'var(--text-faint)' }}>View details</Link>
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

      {/* Submit Proposal Modal */}
      {showProposal && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={() => setShowProposal(null)} />
          <div className="card" style={{ position:'relative', maxWidth:520, width:'100%', padding:28, zIndex:1, background:'var(--bg-raised)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Submit proposal</h3>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>for: <strong style={{ color:'var(--text)' }}>{showProposal.title}</strong></p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div><label style={ls}>Your bid (₹)</label><input type="number" value={proposal.bid} onChange={e=>setProposal({...proposal,bid:e.target.value})} placeholder="15000" className="input" /></div>
              <div><label style={ls}>Delivery time</label><input value={proposal.duration} onChange={e=>setProposal({...proposal,duration:e.target.value})} placeholder="7 days" className="input" /></div>
            </div>
            <div style={{ marginBottom:16 }}><label style={ls}>Cover letter</label><textarea value={proposal.coverLetter} onChange={e=>setProposal({...proposal,coverLetter:e.target.value})} rows={5} placeholder="Explain why you're the best fit…" className="input" style={{ resize:'vertical' }} /></div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={submitProposal} disabled={submitting||!proposal.coverLetter||!proposal.bid} className="btn btn-primary" style={{ flex:1, opacity:(!proposal.coverLetter||!proposal.bid)?0.5:1 }}>{submitting?'Submitting…':'Submit proposal'}</button>
              <button onClick={() => setShowProposal(null)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ls = { display:'block', fontSize:11, color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' };
