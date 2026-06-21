import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STATUS_COLORS = { open:'#10b981', in_progress:'#00d4ff', completed:'#4ade80', cancelled:'#f87171', disputed:'#f87171' };

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
    try {
      const { data } = await axios.get(`${API}/api/projects/${id}`);
      setProject(data);
    } catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const isOwner = project && user && project.clientId?._id === user.id;
  const myProposal = project?.proposals?.find(p => p.freelancerId?.toString?.() === user?.id || p.freelancerId === user?.id);

  const submitProposal = async () => {
    if (!token) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/projects/${id}/proposals`, proposal, { headers:h });
      setMsg('✅ Proposal submitted successfully!');
      setShowProposal(false);
      load();
    } catch(e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed to submit')); }
    finally { setSubmitting(false); }
  };

  const acceptProposal = async (proposalId) => {
    setAcceptingId(proposalId);
    try {
      await axios.put(`${API}/api/projects/${id}/proposals/${proposalId}/accept`, {}, { headers:h });
      setMsg('✅ Proposal accepted! Project is now in progress.');
      load();
    } catch(e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setAcceptingId(null); }
  };

  const gold = '#d4a853';

  if (loading) return <div style={{ background:'#07070f', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:gold, fontFamily:'Syne,sans-serif', paddingTop:64 }}>Loading project...</div>;
  if (!project) return (
    <div style={{ background:'#07070f', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'DM Sans,sans-serif', paddingTop:64, gap:16 }}>
      <div style={{ fontSize:48 }}>🔍</div>
      <h2 style={{ fontFamily:'Syne,sans-serif' }}>Project not found</h2>
      <Link to="/find-work" style={{ color:gold, textDecoration:'none' }}>← Back to Find Work</Link>
    </div>
  );

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 20px' }}>

        <Link to="/find-work" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:13, display:'inline-block', marginBottom:20 }}>← Back to Find Work</Link>

        {msg && <div style={{ background:msg.startsWith('✅')?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:8, padding:'10px 14px', color:msg.startsWith('✅')?'#4ade80':'#f87171', fontSize:13, marginBottom:20, display:'flex', justifyContent:'space-between' }}>{msg}<button onClick={()=>setMsg('')} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div>}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24 }}>

          {/* Main content */}
          <div>
            <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ background:`${STATUS_COLORS[project.status]}18`, color:STATUS_COLORS[project.status], fontSize:11, fontWeight:700, padding:'3px 12px', borderRadius:12, textTransform:'capitalize' }}>{project.status?.replace('_',' ')}</span>
              <span style={{ background:`${gold}15`, color:gold, fontSize:11, padding:'3px 12px', borderRadius:12 }}>{project.category}</span>
              <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>

            <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:'clamp(22px,3vw,32px)', marginBottom:16 }}>{project.title}</h1>

            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:24, marginBottom:20 }}>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:10 }}>📋 Description</h3>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{project.description}</p>
            </div>

            {(project.skills||[]).length > 0 && (
              <div style={{ marginBottom:20 }}>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:10 }}>🛠 Required Skills</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {project.skills.map(s => <span key={s} style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', color:'#a78bfa', fontSize:12, padding:'5px 12px', borderRadius:14 }}>{s}</span>)}
                </div>
              </div>
            )}

            {/* Proposals section - only visible to owner */}
            {isOwner && (
              <div style={{ marginBottom:20 }}>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:14, color:gold }}>📬 Proposals ({project.proposals?.length||0})</h3>
                {(!project.proposals || project.proposals.length === 0) ? (
                  <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:20, textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:13 }}>No proposals yet. Share your project to attract freelancers!</div>
                ) : (
                  <div style={{ display:'grid', gap:12 }}>
                    {project.proposals.map((prop,i) => (
                      <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${prop.status==='accepted'?'rgba(74,222,128,0.35)':'rgba(255,255,255,0.07)'}`, borderRadius:12, padding:18 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:8 }}>
                          <div style={{ fontWeight:700, fontSize:14 }}>Freelancer Proposal #{i+1}</div>
                          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color:gold }}>₹{prop.bid?.toLocaleString()}</span>
                            {prop.duration && <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>⏱ {prop.duration}</span>}
                          </div>
                        </div>
                        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, lineHeight:1.7, marginBottom:12 }}>{prop.coverLetter}</p>
                        {prop.status === 'pending' && project.status === 'open' && (
                          <button onClick={()=>acceptProposal(prop._id)} disabled={acceptingId===prop._id} style={{ background:'linear-gradient(135deg,#4ade80,#16a34a)', color:'#000', border:'none', borderRadius:8, padding:'9px 20px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>{acceptingId===prop._id?'Accepting...':'✅ Accept This Proposal'}</button>
                        )}
                        {prop.status === 'accepted' && <span style={{ color:'#4ade80', fontWeight:700, fontSize:13 }}>✅ Accepted</span>}
                        {prop.status === 'rejected' && <span style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>Not selected</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${gold}25`, borderRadius:14, padding:22, marginBottom:16, position:'sticky', top:80 }}>
              {project.budget && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Budget</div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:24, color:gold }}>₹{project.budget.min?.toLocaleString()} – ₹{project.budget.max?.toLocaleString()}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textTransform:'capitalize' }}>{project.budget.type} price</div>
                </div>
              )}
              <div style={{ display:'grid', gap:10, marginBottom:18 }}>
                {[['⏱ Duration', project.duration||'Flexible'],['👀 Visibility', project.visibility],['📬 Proposals', project.proposals?.length||0]].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ color:'rgba(255,255,255,0.4)' }}>{k}</span>
                    <span style={{ color:'#fff', fontWeight:500, textTransform:'capitalize' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Action button */}
              {!isOwner && project.status === 'open' && !myProposal && (
                <button onClick={() => token ? setShowProposal(true) : navigate('/login')} style={{ width:'100%', background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:9, padding:'13px', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>🚀 Submit Proposal</button>
              )}
              {myProposal && <div style={{ background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.25)', borderRadius:9, padding:'12px', textAlign:'center', color:'#4ade80', fontSize:13, fontWeight:600 }}>✅ You've applied — ₹{myProposal.bid?.toLocaleString()}</div>}
              {project.status !== 'open' && !isOwner && <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:9, padding:'12px', textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:13 }}>This project is no longer accepting proposals</div>}
            </div>

            {/* Client info */}
            {project.clientId && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:18 }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Posted By</div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {project.clientId.photo ? <img src={project.clientId.photo} alt="" style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover' }} /> : <div style={{ width:40, height:40, borderRadius:'50%', background:`${gold}20`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:gold }}>{project.clientId.name?.[0]}</div>}
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{project.clientId.name}</div>
                    {project.clientId.rating > 0 && <div style={{ fontSize:12, color:gold }}>★ {project.clientId.rating}</div>}
                  </div>
                </div>
                {token && !isOwner && <Link to={`/messages?to=${project.clientId._id}`} style={{ display:'block', marginTop:14, textAlign:'center', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', borderRadius:8, padding:'9px', fontSize:12, textDecoration:'none', fontWeight:600 }}>💬 Message</Link>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Proposal Modal */}
      {showProposal && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)' }} onClick={() => setShowProposal(false)} />
          <div style={{ position:'relative', background:'#111', border:`1px solid ${gold}30`, borderRadius:16, maxWidth:540, width:'100%', padding:28, zIndex:1 }}>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, marginBottom:4 }}>Submit Proposal</h3>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginBottom:20 }}>for: <strong style={{ color:'#fff' }}>{project.title}</strong></p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div><label style={ls}>Your Bid (₹) *</label><input type="number" value={proposal.bid} onChange={e=>setProposal({...proposal,bid:e.target.value})} placeholder="e.g. 15000" style={inp} /></div>
              <div><label style={ls}>Delivery Time *</label><input value={proposal.duration} onChange={e=>setProposal({...proposal,duration:e.target.value})} placeholder="e.g. 7 days" style={inp} /></div>
            </div>
            <div style={{ marginBottom:16 }}><label style={ls}>Cover Letter *</label><textarea value={proposal.coverLetter} onChange={e=>setProposal({...proposal,coverLetter:e.target.value})} rows={5} placeholder="Explain why you're the best fit..." style={{ ...inp, resize:'vertical' }} /></div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={submitProposal} disabled={submitting||!proposal.coverLetter||!proposal.bid} style={{ flex:1, background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:9, padding:'12px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:(!proposal.coverLetter||!proposal.bid)?0.5:1 }}>{submitting?'Submitting...':'🚀 Submit Proposal'}</button>
              <button onClick={() => setShowProposal(false)} style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'rgba(255,255,255,0.5)', borderRadius:9, padding:'12px 20px', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

const gold = '#d4a853';
const ls = { display:'block', fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:5, textTransform:'uppercase', letterSpacing:1 };
const inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', color:'#fff', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif' };
