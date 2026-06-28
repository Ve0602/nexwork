import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';
import ReportButton from '../components/ReportButton';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const STATUS_CLASS = { open:'tag-success', in_progress:'tag-accent', completed:'tag-success', cancelled:'tag-danger', disputed:'tag-danger' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProposal, setShowProposal] = useState(false);
  const [proposal, setProposal] = useState({ coverLetter:'', bid:'', duration:'' });
  const [submitting, setSubmitting] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [msg, setMsg] = useState('');
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => { load(); }, [id]);
  const load = async () => {
    setLoading(true);
    try { const { data } = await axios.get(`${API}/api/projects/${id}`); setProject(data); }
    catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const isOwner = project && user && project.clientId?._id === user.id;
  const myProposal = project?.proposals?.find(p => p.freelancerId?.toString?.() === user?.id || p.freelancerId === user?.id);

  const submitProposal = async () => {
    if (!token) { navigate('/login'); return; }
    setSubmitting(true);
    try { await axios.post(`${API}/api/projects/${id}/proposals`, proposal, { headers:h }); setMsg('Proposal submitted'); setShowProposal(false); load(); }
    catch(e) { setMsg(e.response?.data?.message || 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  const acceptProposal = async (proposalId) => {
    setAcceptingId(proposalId);
    try { await axios.put(`${API}/api/projects/${id}/proposals/${proposalId}/accept`, {}, { headers:h }); setMsg('Proposal accepted — project in progress'); load(); }
    catch(e) { setMsg(e.response?.data?.message || 'Failed'); }
    finally { setAcceptingId(null); }
  };

  if (loading) return <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}><TopNav /><div style={{ textAlign:'center', padding:80, color:'var(--text-muted)', fontSize:13 }}>Loading project…</div></div>;
  if (!project) return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ textAlign:'center', padding:80 }}>
        <h2 style={{ fontSize:18, fontWeight:600, marginBottom:12 }}>Project not found</h2>
        <Link to="/find-work" style={{ color:'var(--accent)', fontSize:13 }}>← Back to find work</Link>
      </div>
    </div>
  );

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 24px' }}>

        <Link to="/find-work" style={{ color:'var(--text-faint)', fontSize:13, display:'inline-block', marginBottom:20 }}>← Back to find work</Link>

        {msg && <div className="card" style={{ padding: '10px 14px', marginBottom: 20, fontSize: 13, display:'flex', justifyContent:'space-between' }}>{msg}<button onClick={()=>setMsg('')} className="btn btn-ghost" style={{padding:0}}>✕</button></div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>

          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={`tag ${STATUS_CLASS[project.status]}`} style={{ textTransform:'capitalize' }}>{project.status?.replace('_',' ')}</span>
              <span className="tag tag-accent">{project.category}</span>
              <span style={{ color:'var(--text-faint)', fontSize:12 }}>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 600, marginBottom: 18 }}>{project.title}</h1>

            <div className="card" style={{ padding: 20, marginBottom: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Description</h3>
              <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{project.description}</p>
            </div>

            {(project.skills||[]).length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Required skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>{project.skills.map(s => <span key={s} className="tag">{s}</span>)}</div>
              </div>
            )}

            {isOwner && (
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Proposals ({project.proposals?.length||0})</h3>
                {(!project.proposals || project.proposals.length === 0) ? (
                  <div className="card" style={{ padding:20, textAlign:'center', color:'var(--text-faint)', fontSize:13 }}>No proposals yet.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {project.proposals.map((prop,i) => (
                      <div key={i} className="card" style={{ padding:16, borderColor: prop.status==='accepted'?'var(--success)':'var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>Freelancer proposal #{i+1}</div>
                          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                            <span className="mono" style={{ fontWeight: 600 }}>₹{prop.bid?.toLocaleString()}</span>
                            {prop.duration && <span style={{ fontSize:12, color:'var(--text-faint)' }}>{prop.duration}</span>}
                          </div>
                        </div>
                        <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.7, marginBottom:10 }}>{prop.coverLetter}</p>
                        {prop.status === 'pending' && project.status === 'open' && <button onClick={()=>acceptProposal(prop._id)} disabled={acceptingId===prop._id} className="btn btn-primary">{acceptingId===prop._id?'Accepting…':'Accept this proposal'}</button>}
                        {prop.status === 'accepted' && <span style={{ color:'var(--success)', fontWeight:600, fontSize:13 }}>Accepted</span>}
                        {prop.status === 'rejected' && <span style={{ color:'var(--text-faint)', fontSize:13 }}>Not selected</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="card" style={{ padding: 20, marginBottom: 16, position:'sticky', top:80 }}>
              {project.budget && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Budget</div>
                  <div className="mono" style={{ fontWeight: 600, fontSize: 22 }}>₹{project.budget.min?.toLocaleString()}–₹{project.budget.max?.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)', textTransform: 'capitalize' }}>{project.budget.type} price</div>
                </div>
              )}
              <div style={{ display: 'grid', gap: 8, marginBottom: 18 }}>
                {[['Duration', project.duration||'Flexible'],['Proposals', project.proposals?.length||0]].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-faint)' }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              {!isOwner && project.status === 'open' && !myProposal && (
                <button onClick={() => token ? setShowProposal(true) : navigate('/login')} className="btn btn-primary" style={{ width:'100%' }}>Submit proposal</button>
              )}
              {myProposal && <div className="tag tag-success" style={{ width:'100%', textAlign:'center', padding:'10px', display:'block' }}>Applied — ₹{myProposal.bid?.toLocaleString()}</div>}
            </div>

            {project.clientId && (
              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Posted by</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {project.clientId.photo ? <img src={project.clientId.photo} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : <div className="mono" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{project.clientId.name?.[0]}</div>}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{project.clientId.name}</div>
                    {project.clientId.rating > 0 && <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>★ {project.clientId.rating}</div>}
                  </div>
                </div>
                {token && !isOwner && <Link to={`/messages?to=${project.clientId._id}`} className="btn btn-secondary" style={{ width:'100%', marginTop:12, textAlign:'center' }}>Message</Link>}
                {token && (
                  <div style={{ textAlign: 'center', marginTop: 10 }}>
                    <ReportButton targetType="project" targetId={project._id} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showProposal && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={() => setShowProposal(false)} />
          <div className="card" style={{ position:'relative', maxWidth:480, width:'100%', padding:24, zIndex:1, background:'var(--bg-raised)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Submit proposal</h3>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:18 }}>for: <strong style={{ color:'var(--text)' }}>{project.title}</strong></p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div><label style={ls}>Bid (₹)</label><input type="number" value={proposal.bid} onChange={e=>setProposal({...proposal,bid:e.target.value})} className="input" /></div>
              <div><label style={ls}>Delivery</label><input value={proposal.duration} onChange={e=>setProposal({...proposal,duration:e.target.value})} placeholder="7 days" className="input" /></div>
            </div>
            <label style={ls}>Cover letter</label>
            <textarea value={proposal.coverLetter} onChange={e=>setProposal({...proposal,coverLetter:e.target.value})} rows={5} className="input" style={{ resize:'vertical', marginBottom:14 }} />
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={submitProposal} disabled={submitting||!proposal.coverLetter||!proposal.bid} className="btn btn-primary" style={{ flex:1 }}>{submitting?'Submitting…':'Submit proposal'}</button>
              <button onClick={() => setShowProposal(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const ls = { display:'block', fontSize:11, color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' };
