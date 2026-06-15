import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const JOB_TYPES = ['All','fulltime','parttime','contract','internship','freelance'];
const JOB_MODES = ['All','remote','onsite','hybrid'];

export default function JobsPage() {
  const { token, user } = useAuth();
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [type, setType]         = useState('');
  const [mode, setMode]         = useState('');
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);
  const [appForm, setAppForm]   = useState({ coverLetter:'', resumeUrl:'' });
  const [msg, setMsg]           = useState('');

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
    if (!token) return setMsg('Please login to apply');
    setApplying(true);
    try {
      await axios.post(`${API}/api/jobs/${selected._id}/apply`, appForm, { headers:{ Authorization:`Bearer ${token}` } });
      setMsg('✅ Application submitted successfully!');
      setSelected(null);
      setAppForm({ coverLetter:'', resumeUrl:'' });
    } catch(e) { setMsg('❌ '+(e.response?.data?.message||'Application failed')); }
    finally { setApplying(false); }
  };

  const gold = '#d4a853';
  const modeColors = { remote:'#10b981', onsite:'#f59e0b', hybrid:'#6366f1' };
  const typeColors  = { fulltime:'#00d4ff', parttime:'#7c3aed', contract:gold, internship:'#e91e8c', freelance:'#14b8a6' };

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#001a0a,#07070f)', padding:'40px 60px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:'clamp(24px,4vw,40px)', marginBottom:8 }}>
          Find <span style={{ color:'#10b981' }}>Jobs</span>
        </h1>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, marginBottom:24 }}>{total} job openings</p>

        <div style={{ display:'flex', gap:10, maxWidth:700, marginBottom:20 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loadJobs()} placeholder="Search jobs by title or company..." style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'13px 16px', color:'#fff', fontSize:14, outline:'none', fontFamily:'DM Sans,sans-serif' }} />
          <button onClick={loadJobs} style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:10, padding:'13px 24px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Search</button>
        </div>

        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', alignSelf:'center', textTransform:'uppercase', letterSpacing:1 }}>Type:</span>
            {JOB_TYPES.map(t => <button key={t} onClick={()=>{setType(t==='All'?'':t);setPage(1);}} style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${(type===t||(t==='All'&&!type))?typeColors[t]||'#10b981':'rgba(255,255,255,0.1)'}`, background:(type===t||(t==='All'&&!type))?`${typeColors[t]||'#10b981'}18`:'transparent', color:(type===t||(t==='All'&&!type))?typeColors[t]||'#10b981':'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', textTransform:'capitalize' }}>{t}</button>)}
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', alignSelf:'center', textTransform:'uppercase', letterSpacing:1 }}>Mode:</span>
            {JOB_MODES.map(m => <button key={m} onClick={()=>{setMode(m==='All'?'':m);setPage(1);}} style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${(mode===m||(m==='All'&&!mode))?modeColors[m]||'#10b981':'rgba(255,255,255,0.1)'}`, background:(mode===m||(m==='All'&&!mode))?`${modeColors[m]||'#10b981'}18`:'transparent', color:(mode===m||(m==='All'&&!mode))?modeColors[m]||'#10b981':'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', textTransform:'capitalize' }}>{m}</button>)}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:0 }}>
        {/* Job list */}
        <div style={{ padding:'24px 40px', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
          {msg && <div style={{ background:msg.startsWith('✅')?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:8, padding:'10px 14px', color:msg.startsWith('✅')?'#4ade80':'#f87171', fontSize:13, marginBottom:16 }}>{msg}</div>}

          {loading ? <div style={{ textAlign:'center', padding:60, color:'#10b981' }}>Loading jobs...</div>
          : jobs.length===0 ? <div style={{ textAlign:'center', padding:60 }}>
              <div style={{ fontSize:48, marginBottom:14 }}>💼</div>
              <h3 style={{ fontFamily:'Syne,sans-serif', color:'#fff', marginBottom:8 }}>No jobs found</h3>
              <p style={{ color:'rgba(255,255,255,0.4)' }}>Try different filters</p>
            </div>
          : (
            <div style={{ display:'grid', gap:12 }}>
              {jobs.map(j => (
                <div key={j._id} onClick={() => setSelected(j)} style={{ background: selected?._id===j._id?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.03)', border:`1px solid ${selected?._id===j._id?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.07)'}`, borderRadius:12, padding:'18px 20px', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>{if(selected?._id!==j._id){e.currentTarget.style.borderColor='rgba(16,185,129,0.3)'; e.currentTarget.style.background='rgba(255,255,255,0.05)';}}}
                  onMouseLeave={e=>{if(selected?._id!==j._id){e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='rgba(255,255,255,0.03)';}}}>
                  <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:7, marginBottom:8, flexWrap:'wrap' }}>
                        {j.type && <span style={{ background:`${typeColors[j.type]||'#10b981'}15`, color:typeColors[j.type]||'#10b981', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, textTransform:'uppercase' }}>{j.type}</span>}
                        {j.mode && <span style={{ background:`${modeColors[j.mode]}15`, color:modeColors[j.mode], fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, textTransform:'capitalize' }}>{j.mode}</span>}
                        {j.isVerified && <span style={{ background:'rgba(74,222,128,0.1)', color:'#4ade80', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10 }}>✓ Verified</span>}
                      </div>
                      <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#fff', marginBottom:4 }}>{j.title}</h3>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>🏢 {j.company} {j.location&&`· 📍 ${j.location}`}</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {(j.skills||[]).slice(0,4).map(s=><span key={s} style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.18)', color:'#6ee7b7', fontSize:10, padding:'2px 7px', borderRadius:8 }}>{s}</span>)}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      {j.salary && <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:gold }}>₹{j.salary.min?.toLocaleString()}-{j.salary.max?.toLocaleString()}<div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:'DM Sans,sans-serif', fontWeight:400 }}>/{j.salary.period||'month'}</div></div>}
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:6 }}>{j.applications?.length||0} applied</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:2 }}>{new Date(j.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
              {total>12 && (
                <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:12 }}>
                  {page>1 && <button onClick={()=>setPage(p=>p-1)} style={pgBtn}>← Prev</button>}
                  <span style={{ padding:'9px 16px', color:'rgba(255,255,255,0.5)', fontSize:13 }}>Page {page} of {Math.ceil(total/12)}</span>
                  {page<Math.ceil(total/12) && <button onClick={()=>setPage(p=>p+1)} style={pgBtn}>Next →</button>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Job detail panel */}
        <div style={{ padding:'24px 28px', position:'sticky', top:64, maxHeight:'calc(100vh - 64px)', overflowY:'auto' }}>
          {selected ? (
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', gap:7, marginBottom:10, flexWrap:'wrap' }}>
                  {selected.type && <span style={{ background:`${typeColors[selected.type]}15`, color:typeColors[selected.type], fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:10, textTransform:'uppercase' }}>{selected.type}</span>}
                  {selected.mode && <span style={{ background:`${modeColors[selected.mode]}15`, color:modeColors[selected.mode], fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:10, textTransform:'capitalize' }}>{selected.mode}</span>}
                </div>
                <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:'#fff', marginBottom:6 }}>{selected.title}</h2>
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:4 }}>🏢 {selected.company}</div>
                {selected.location && <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>📍 {selected.location}</div>}
              </div>

              {selected.salary && (
                <div style={{ background:`${gold}10`, border:`1px solid ${gold}25`, borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:2, textTransform:'uppercase', letterSpacing:1 }}>Salary</div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:gold }}>₹{selected.salary.min?.toLocaleString()} – ₹{selected.salary.max?.toLocaleString()}<span style={{ fontSize:12, fontFamily:'DM Sans,sans-serif', fontWeight:400, color:'rgba(255,255,255,0.4)' }}> /{selected.salary.period||'month'}</span></div>
                </div>
              )}

              <div style={{ marginBottom:14 }}>
                <div style={{ fontWeight:700, color:'#fff', marginBottom:6, fontSize:14 }}>📋 Description</div>
                <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, lineHeight:1.7 }}>{selected.description}</p>
              </div>

              {(selected.skills||[]).length>0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontWeight:700, color:'#fff', marginBottom:8, fontSize:14 }}>🛠 Required Skills</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{selected.skills.map(s=><span key={s} style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#6ee7b7', fontSize:12, padding:'4px 10px', borderRadius:10 }}>{s}</span>)}</div>
                </div>
              )}

              {selected.experience && <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:14 }}>Experience: {selected.experience.min}-{selected.experience.max} years</div>}

              <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:16 }}>
                <h3 style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Apply for this job</h3>
                <textarea value={appForm.coverLetter} onChange={e=>setAppForm({...appForm,coverLetter:e.target.value})} rows={4} placeholder="Write a brief cover letter..." style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', color:'#fff', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif', resize:'vertical', marginBottom:10 }} />
                <input value={appForm.resumeUrl} onChange={e=>setAppForm({...appForm,resumeUrl:e.target.value})} placeholder="Resume URL (Google Drive link)" style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', color:'#fff', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif', marginBottom:12 }} />
                <button onClick={applyJob} disabled={applying} style={{ width:'100%', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:9, padding:'13px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:applying?0.7:1 }}>
                  {applying?'⏳ Applying...':'🚀 Apply Now'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>👈</div>
              <p style={{ fontSize:14 }}>Select a job to see details and apply</p>
            </div>
          )}
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

const gold = '#d4a853';
const pgBtn = { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', borderRadius:8, padding:'9px 18px', cursor:'pointer', fontSize:13, fontFamily:'DM Sans,sans-serif' };
