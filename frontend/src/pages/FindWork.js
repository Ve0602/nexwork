import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CATEGORIES = ['All','AI & Machine Learning','Web Development','Data Science','Design & Creative','Content Writing','Tailoring & Fashion','Home Services','Photography','Teaching','Mobile Development','Other'];
const BUDGETS = [{label:'Any Budget',value:''},{label:'Under ₹5,000',value:'0-5000'},{label:'₹5,000 – ₹25,000',value:'5000-25000'},{label:'₹25,000 – ₹1,00,000',value:'25000-100000'},{label:'₹1,00,000+',value:'100000-999999'}];

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
    if (!token) return setMsg('Please login to submit a proposal');
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/projects/${showProposal._id}/proposals`, proposal, { headers:{ Authorization:`Bearer ${token}` } });
      setMsg('✅ Proposal submitted!');
      setShowProposal(null);
      setProposal({ coverLetter:'', bid:'', duration:'' });
    } catch (e) { setMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setSubmitting(false); }
  };

  const gold = '#d4a853';

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ background:'linear-gradient(135deg,#0d0820,#07070f)', padding:'40px 60px 28px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:'clamp(24px,4vw,40px)', marginBottom:8 }}>Find <span style={{ color:gold }}>Work</span></h1>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, marginBottom:20 }}>{total} open projects</p>
        <div style={{ display:'flex', gap:10, maxWidth:700, marginBottom:16 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loadProjects()} placeholder="Search projects..." style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'12px 16px', color:'#fff', fontSize:14, outline:'none', fontFamily:'DM Sans,sans-serif' }} />
          <button onClick={loadProjects} style={{ background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:10, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Search</button>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={()=>{setCategory(c==='All'?'':c);setPage(1);}} style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${(category===c||(c==='All'&&!category))?gold:'rgba(255,255,255,0.1)'}`, background:(category===c||(c==='All'&&!category))?`${gold}18`:'transparent', color:(category===c||(c==='All'&&!category))?gold:'rgba(255,255,255,0.45)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:24, padding:'24px 60px' }}>
        <div>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:16 }}>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:14 }}>Budget</h3>
            {BUDGETS.map(b => (
              <div key={b.label} onClick={()=>setBudget(b.value)} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width:14, height:14, borderRadius:'50%', border:`2px solid ${budget===b.value?gold:'rgba(255,255,255,0.2)'}`, background:budget===b.value?gold:'transparent', flexShrink:0 }} />
                <span style={{ fontSize:12, color:budget===b.value?gold:'rgba(255,255,255,0.5)' }}>{b.label}</span>
              </div>
            ))}
          </div>
          <div style={{ background:`${gold}10`, border:`1px solid ${gold}25`, borderRadius:12, padding:16, marginTop:14, textAlign:'center' }}>
            <div style={{ fontSize:26, marginBottom:8 }}>💼</div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginBottom:10, lineHeight:1.5 }}>Have a project to post?</p>
            <Link to="/post-project" style={{ display:'block', background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', textDecoration:'none', padding:'8px', borderRadius:8, fontWeight:700, fontSize:12 }}>Post Project →</Link>
          </div>
        </div>

        <div>
          {msg && <div style={{ background:msg.startsWith('✅')?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:8, padding:'10px 14px', color:msg.startsWith('✅')?'#4ade80':'#f87171', fontSize:13, marginBottom:16, display:'flex', justifyContent:'space-between' }}>{msg}<button onClick={()=>setMsg('')} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div>}
          {loading ? <div style={{ textAlign:'center', padding:60, color:gold }}>Loading projects...</div>
          : projects.length===0 ? <div style={{ textAlign:'center', padding:'60px 20px' }}><div style={{ fontSize:48, marginBottom:14 }}>🔍</div><h3 style={{ fontFamily:'Syne,sans-serif', color:'#fff', marginBottom:8 }}>No projects found</h3><p style={{ color:'rgba(255,255,255,0.4)' }}>Try different keywords</p></div>
          : (
            <>
              <div style={{ display:'grid', gap:14 }}>
                {projects.map(p => (
                  <div key={p._id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:13, padding:'18px 20px', transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=`${gold}40`;e.currentTarget.style.background='rgba(255,255,255,0.05)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.background='rgba(255,255,255,0.03)';}}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                          <span style={{ background:`${gold}15`, color:gold, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, textTransform:'uppercase' }}>{p.category}</span>
                          {p.duration && <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>⏱ {p.duration}</span>}
                          <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>📅 {new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#fff', marginBottom:8 }}>{p.title}</h3>
                        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, lineHeight:1.6, marginBottom:8 }}>{p.description?.substring(0,180)}{p.description?.length>180?'...':''}</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                          {(p.skills||[]).map(s=><span key={s} style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', color:'#a78bfa', fontSize:11, padding:'2px 8px', borderRadius:12 }}>{s}</span>)}
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        {p.budget && <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, color:gold, marginBottom:4 }}>₹{p.budget.min?.toLocaleString()} – ₹{p.budget.max?.toLocaleString()}</div>}
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:10 }}>{p.proposals?.length||0} proposals</div>
                        <button onClick={()=>setShowProposal(p)} style={{ background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:9, padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif', display:'block', marginBottom:6 }}>Submit Proposal →</button>
                        <Link to={`/projects/${p._id}`} style={{ display:'block', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:12, textDecoration:'none' }}>View Details</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {total>12 && (
                <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:20 }}>
                  {page>1 && <button onClick={()=>setPage(p=>p-1)} style={pgBtn}>← Prev</button>}
                  <span style={{ padding:'9px 16px', color:'rgba(255,255,255,0.5)', fontSize:13 }}>Page {page} of {Math.ceil(total/12)}</span>
                  {page<Math.ceil(total/12) && <button onClick={()=>setPage(p=>p+1)} style={pgBtn}>Next →</button>}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showProposal && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)' }} onClick={()=>setShowProposal(null)} />
          <div style={{ position:'relative', background:'#111', border:`1px solid ${gold}30`, borderRadius:16, maxWidth:540, width:'100%', padding:28, zIndex:1 }}>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, marginBottom:4 }}>Submit Proposal</h3>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginBottom:20 }}>for: <strong style={{ color:'#fff' }}>{showProposal.title}</strong></p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div><label style={ls}>Your Bid (₹) *</label><input type="number" value={proposal.bid} onChange={e=>setProposal({...proposal,bid:e.target.value})} placeholder="e.g. 15000" style={inp} /></div>
              <div><label style={ls}>Delivery Time *</label><input value={proposal.duration} onChange={e=>setProposal({...proposal,duration:e.target.value})} placeholder="e.g. 7 days" style={inp} /></div>
            </div>
            <div style={{ marginBottom:16 }}><label style={ls}>Cover Letter *</label><textarea value={proposal.coverLetter} onChange={e=>setProposal({...proposal,coverLetter:e.target.value})} rows={5} placeholder="Explain why you're the best fit..." style={{ ...inp, resize:'vertical' }} /></div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={submitProposal} disabled={submitting||!proposal.coverLetter||!proposal.bid} style={{ flex:1, background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:9, padding:'12px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:(!proposal.coverLetter||!proposal.bid)?0.5:1 }}>{submitting?'Submitting...':'🚀 Submit Proposal'}</button>
              <button onClick={()=>setShowProposal(null)} style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'rgba(255,255,255,0.5)', borderRadius:9, padding:'12px 20px', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}
const gold='#d4a853';
const ls={display:'block',fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:5,textTransform:'uppercase',letterSpacing:1};
const inp={width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'};
const pgBtn={background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',borderRadius:8,padding:'9px 18px',cursor:'pointer',fontSize:13,fontFamily:'DM Sans,sans-serif'};
