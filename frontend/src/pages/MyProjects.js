import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STATUS_COLORS = { open:'#10b981', in_progress:'#00d4ff', completed:'#4ade80', cancelled:'#f87171', disputed:'#ef4444' };

export default function MyProjects() {
  const { token, user } = useAuth();
  const [data, setData]     = useState({ asClient:[], asFreelancer:[] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('asClient');
  const [selected, setSelected] = useState(null);
  const [msg, setMsg]       = useState('');
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data: d } = await axios.get(`${API}/api/projects/my/all`, { headers:h });
      setData(d);
    } catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const acceptProposal = async (projectId, proposalId) => {
    try {
      await axios.put(`${API}/api/projects/${projectId}/proposals/${proposalId}/accept`, {}, { headers:h });
      setMsg('✅ Proposal accepted! Project started.');
      load(); setSelected(null);
    } catch(e) { setMsg('❌ '+(e.response?.data?.message||'Failed')); }
  };

  const gold = '#d4a853';
  const current = data[tab] || [];

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ padding:'32px 60px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:28 }}>📋 My Projects</h1>
          <Link to="/post-project" style={{ background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', textDecoration:'none', padding:'10px 22px', borderRadius:9, fontWeight:700, fontSize:13 }}>+ Post Project</Link>
        </div>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:24 }}>Manage all your projects and proposals</p>

        {msg && <div style={{ background:msg.startsWith('✅')?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:8, padding:'10px 14px', color:msg.startsWith('✅')?'#4ade80':'#f87171', fontSize:13, marginBottom:16, display:'flex', justifyContent:'space-between' }}>{msg}<button onClick={()=>setMsg('')} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div>}

        {/* Tabs */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:4, marginBottom:24, width:'fit-content', gap:4 }}>
          {[['asClient','🚀 Posted by Me'],['asFreelancer','💼 Working On']].map(([id,label]) => (
            <button key={id} onClick={()=>setTab(id)} style={{ padding:'10px 20px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, background:tab===id?'rgba(255,255,255,0.08)':'transparent', color:tab===id?'#fff':'rgba(255,255,255,0.4)' }}>{label} ({data[id]?.length||0})</button>
          ))}
        </div>

        {loading ? <div style={{ textAlign:'center', padding:60, color:gold }}>Loading projects...</div>
        : current.length===0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:52, marginBottom:14 }}>📋</div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:20, marginBottom:8 }}>No projects yet</h3>
            <p style={{ color:'rgba(255,255,255,0.4)', marginBottom:20 }}>{tab==='asClient'?'Post a project to find talented freelancers':'Browse projects and submit proposals to start working'}</p>
            <Link to={tab==='asClient'?'/post-project':'/find-work'} style={{ background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', textDecoration:'none', padding:'11px 24px', borderRadius:9, fontWeight:700, fontSize:14 }}>{tab==='asClient'?'Post a Project →':'Find Work →'}</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns: selected?'1fr 400px':'1fr', gap:20 }}>
            <div style={{ display:'grid', gap:12 }}>
              {current.map(p => (
                <div key={p._id} onClick={()=>setSelected(selected?._id===p._id?null:p)} style={{ background: selected?._id===p._id?'rgba(212,168,83,0.05)':'rgba(255,255,255,0.03)', border:`1px solid ${selected?._id===p._id?`${gold}35`:'rgba(255,255,255,0.07)'}`, borderRadius:13, padding:'18px 20px', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>{if(selected?._id!==p._id) e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}
                  onMouseLeave={e=>{if(selected?._id!==p._id) e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';}}>
                  <div style={{ display:'flex', justifyContent:'space-between', gap:14, flexWrap:'wrap' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                        <span style={{ background:`${STATUS_COLORS[p.status]}15`, color:STATUS_COLORS[p.status], fontSize:10, fontWeight:700, padding:'2px 9px', borderRadius:10, textTransform:'uppercase' }}>{p.status?.replace('_',' ')}</span>
                        <span style={{ background:`${gold}12`, color:gold, fontSize:10, padding:'2px 8px', borderRadius:8 }}>{p.category}</span>
                        <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#fff', marginBottom:6 }}>{p.title}</h3>
                      <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13, lineHeight:1.5, marginBottom:8 }}>{p.description?.substring(0,140)}{p.description?.length>140?'...':''}</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {(p.skills||[]).slice(0,4).map(s=><span key={s} style={{ background:'rgba(99,102,241,0.1)', color:'#a78bfa', fontSize:10, padding:'2px 7px', borderRadius:8 }}>{s}</span>)}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      {p.budget && <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:gold }}>₹{p.budget.min?.toLocaleString()}-{p.budget.max?.toLocaleString()}</div>}
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:4 }}>{p.proposals?.length||0} proposals</div>
                      {tab==='asClient' && p.status==='open' && p.proposals?.length>0 && (
                        <div style={{ background:'rgba(212,168,83,0.12)', border:`1px solid ${gold}25`, color:gold, fontSize:11, padding:'3px 8px', borderRadius:8, marginTop:6 }}>Review proposals →</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Project detail */}
            {selected && (
              <div style={{ background:'#111', border:`1px solid ${gold}25`, borderRadius:14, padding:22, alignSelf:'start', maxHeight:'80vh', overflowY:'auto' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                  <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16 }}>Project Details</h3>
                  <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:18 }}>✕</button>
                </div>

                <h4 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:6 }}>{selected.title}</h4>
                <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, lineHeight:1.6, marginBottom:14 }}>{selected.description}</p>

                {[['Category', selected.category],['Budget', `₹${selected.budget?.min?.toLocaleString()} – ₹${selected.budget?.max?.toLocaleString()}`],['Duration', selected.duration||'Flexible'],['Status', selected.status?.replace('_',' ')]].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:13 }}>
                    <span style={{ color:'rgba(255,255,255,0.4)' }}>{k}</span>
                    <span style={{ color:'#fff', fontWeight:500, textTransform:'capitalize' }}>{v}</span>
                  </div>
                ))}

                {/* Proposals (for client) */}
                {tab==='asClient' && selected.proposals?.length>0 && (
                  <div style={{ marginTop:16 }}>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:10, color:gold }}>📩 Proposals ({selected.proposals.length})</div>
                    {selected.proposals.map((prop,i) => (
                      <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${prop.status==='accepted'?'rgba(74,222,128,0.3)':'rgba(255,255,255,0.08)'}`, borderRadius:10, padding:'14px', marginBottom:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:gold }}>₹{prop.bid?.toLocaleString()}</div>
                          <span style={{ background:prop.status==='accepted'?'rgba(74,222,128,0.15)':prop.status==='rejected'?'rgba(239,68,68,0.1)':'rgba(255,255,255,0.08)', color:prop.status==='accepted'?'#4ade80':prop.status==='rejected'?'#f87171':'rgba(255,255,255,0.5)', fontSize:11, padding:'2px 8px', borderRadius:8, textTransform:'capitalize' }}>{prop.status}</span>
                        </div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>⏱ {prop.duration}</div>
                        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, lineHeight:1.5, marginBottom:10 }}>{prop.coverLetter}</p>
                        {prop.status==='pending' && selected.status==='open' && (
                          <button onClick={()=>acceptProposal(selected._id, prop._id)} style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>✅ Accept Proposal</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Freelancer info */}
                {tab==='asFreelancer' && selected.clientId && (
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Client</div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {selected.clientId.photo ? <img src={selected.clientId.photo} alt="" style={{ width:36, height:36, borderRadius:'50%' }} /> : <div style={{ width:36, height:36, borderRadius:'50%', background:`${gold}20`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:gold }}>{selected.clientId.name?.[0]}</div>}
                      <span style={{ fontWeight:600 }}>{selected.clientId.name}</span>
                    </div>
                  </div>
                )}

                <Link to={`/messages?to=${tab==='asClient'?selected.freelancerId?._id:selected.clientId?._id}`} style={{ display:'block', marginTop:14, background:'rgba(255,255,255,0.06)', border:'none', color:'rgba(255,255,255,0.6)', borderRadius:8, padding:'11px', fontWeight:600, fontSize:13, textDecoration:'none', textAlign:'center' }}>💬 Send Message</Link>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}
