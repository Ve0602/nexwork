import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const STATUS_CLASS = { open:'tag-success', in_progress:'tag-accent', completed:'tag-success', cancelled:'tag-danger', disputed:'tag-danger' };

export default function MyProjects() {
  const { token } = useAuth();
  const [data, setData] = useState({ asClient:[], asFreelancer:[] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('asClient');
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { const { data: d } = await axios.get(`${API}/api/projects/my/all`, { headers:h }); setData(d); }
    catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const acceptProposal = async (projectId, proposalId) => {
    try { await axios.put(`${API}/api/projects/${projectId}/proposals/${proposalId}/accept`, {}, { headers:h }); setMsg('Proposal accepted — project started'); load(); setSelected(null); }
    catch(e) { setMsg(e.response?.data?.message||'Failed'); }
  };

  const list = data[tab] || [];

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap:'wrap', gap:12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>My projects</h1>
          <Link to="/post-project" className="btn btn-primary">Post project</Link>
        </div>

        {msg && <div className="card" style={{ padding: '10px 14px', marginBottom: 16, fontSize: 13, display:'flex', justifyContent:'space-between' }}>{msg}<button onClick={()=>setMsg('')} className="btn btn-ghost" style={{padding:0}}>✕</button></div>}

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom:'1px solid var(--border)' }}>
          {[['asClient','Posted projects'],['asFreelancer','Active work']].map(([id,label]) => (
            <button key={id} onClick={()=>setTab(id)} style={{ padding:'10px 14px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:500, color: tab===id?'var(--accent)':'var(--text-muted)', borderBottom: tab===id?'2px solid var(--accent)':'2px solid transparent' }}>{label} ({(data[id]||[]).length})</button>
          ))}
        </div>

        {loading ? <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontSize:13 }}>Loading…</div>
        : list.length === 0 ? (
          <div style={{ textAlign:'center', padding:60 }}>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:16 }}>{tab==='asClient'?'No projects posted yet.':'No active work yet — browse projects to get started.'}</p>
            <Link to={tab==='asClient'?'/post-project':'/find-work'} className="btn btn-primary">{tab==='asClient'?'Post a project →':'Find work →'}</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              {list.map(p => (
                <div key={p._id} onClick={() => setSelected(selected?._id===p._id?null:p)} className="card" style={{ padding: '16px 18px', cursor: 'pointer', borderColor: selected?._id===p._id ? 'var(--accent)' : 'var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className={`tag ${STATUS_CLASS[p.status]}`} style={{ textTransform:'capitalize' }}>{p.status?.replace('_',' ')}</span>
                        <span className="tag tag-accent">{p.category}</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{p.title}</div>
                      <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.5, marginBottom:8 }}>{p.description?.substring(0,110)}…</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>{(p.skills||[]).slice(0,4).map(s => <span key={s} className="tag">{s}</span>)}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      {p.budget && <div className="mono" style={{ fontWeight:600, fontSize:15 }}>₹{p.budget.min?.toLocaleString()}–{p.budget.max?.toLocaleString()}</div>}
                      <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:4 }}>{p.proposals?.length||0} proposals</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div className="card" style={{ padding: 20, alignSelf:'start', position:'sticky', top:80, maxHeight:'80vh', overflowY:'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>{selected.title}</h3>
                  <button onClick={()=>setSelected(null)} className="btn btn-ghost">✕</button>
                </div>
                <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.6, marginBottom:16 }}>{selected.description}</p>

                {tab==='asClient' && selected.proposals?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Proposals ({selected.proposals.length})</h4>
                    {selected.proposals.map((prop, i) => (
                      <div key={i} className="card" style={{ padding:14, marginBottom:10, borderColor: prop.status==='accepted'?'var(--success)':'var(--border)' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                          <span style={{ fontSize:12, fontWeight:600 }}>Freelancer #{i+1}</span>
                          <span className="mono" style={{ fontWeight:600 }}>₹{prop.bid?.toLocaleString()}</span>
                        </div>
                        <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6, marginBottom:10 }}>{prop.coverLetter}</p>
                        {prop.status === 'pending' && selected.status === 'open' && <button onClick={()=>acceptProposal(selected._id, prop._id)} className="btn btn-primary" style={{ width:'100%' }}>Accept proposal</button>}
                        {prop.status === 'accepted' && <span style={{ color:'var(--success)', fontWeight:600, fontSize:12 }}>Accepted</span>}
                      </div>
                    ))}
                  </div>
                )}

                <Link to="/messages" className="btn btn-secondary" style={{ width:'100%', marginTop:8, textAlign:'center' }}>Message</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
