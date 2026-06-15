import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ROLES = ['All','freelancer','service_provider','mentor','trainer','professional'];
const ROLE_LABELS = { freelancer:'Freelancer', service_provider:'Service Provider', mentor:'Mentor', trainer:'Trainer', professional:'Professional' };
const SKILLS = ['Python','JavaScript','React','AI/ML','Prompt Engineering','Data Annotation','Graphic Design','Node.js','Content Writing','Tailoring','Photography'];

export default function FindTalent() {
  const { token } = useAuth();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [role, setRole]         = useState('');
  const [skill, setSkill]       = useState('');
  const [location, setLocation] = useState('');
  const [minRate, setMinRate]   = useState('');
  const [maxRate, setMaxRate]   = useState('');
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadTalent(); }, [page, role, skill]);

  const loadTalent = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 12 });
      if (role && role !== 'All') q.set('role', role);
      if (skill) q.set('skill', skill);
      if (search) q.set('search', search);
      if (location) q.set('location', location);
      if (minRate) q.set('minRate', minRate);
      if (maxRate) q.set('maxRate', maxRate);
      const { data } = await axios.get(`${API}/api/users/search?${q}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const gold = '#d4a853';

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0d0820,#07070f)', padding:'40px 60px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:'clamp(24px,4vw,40px)', marginBottom:8 }}>Find <span style={{ color:'#7c3aed' }}>Talent</span></h1>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, marginBottom:24 }}>{total} professionals available</p>

        {/* Search */}
        <div style={{ display:'flex', gap:10, maxWidth:700, marginBottom:20 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter' && loadTalent()} placeholder="Search by name, skill, or headline..." style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'13px 16px', color:'#fff', fontSize:14, outline:'none', fontFamily:'DM Sans,sans-serif' }} />
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location..." style={{ width:160, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'13px 16px', color:'#fff', fontSize:14, outline:'none', fontFamily:'DM Sans,sans-serif' }} />
          <button onClick={loadTalent} style={{ background:`linear-gradient(135deg,#7c3aed,#6d28d9)`, color:'#fff', border:'none', borderRadius:10, padding:'13px 24px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Search</button>
        </div>

        {/* Role pills */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {ROLES.map(r => (
            <button key={r} onClick={() => { setRole(r==='All'?'':r); setPage(1); }} style={{ padding:'7px 16px', borderRadius:20, border:`1px solid ${(role===r||(r==='All'&&!role))?'#7c3aed':'rgba(255,255,255,0.1)'}`, background:(role===r||(r==='All'&&!role))?'rgba(124,58,237,0.2)':'transparent', color:(role===r||(r==='All'&&!role))?'#a78bfa':'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
              {r==='All'?'All Roles':ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:24, padding:'28px 60px' }}>

        {/* Sidebar */}
        <div>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:18 }}>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, marginBottom:16 }}>Filters</h3>

            <div style={{ marginBottom:16 }}>
              <label style={ls}>Skill</label>
              <select value={skill} onChange={e => setSkill(e.target.value)} style={selS}>
                <option value="">Any Skill</option>
                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={ls}>Hourly Rate (₹)</label>
              <div style={{ display:'flex', gap:8 }}>
                <input type="number" value={minRate} onChange={e => setMinRate(e.target.value)} placeholder="Min" style={{ ...selS, flex:1 }} />
                <input type="number" value={maxRate} onChange={e => setMaxRate(e.target.value)} placeholder="Max" style={{ ...selS, flex:1 }} />
              </div>
            </div>

            <button onClick={loadTalent} style={{ width:'100%', background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.3)', color:'#a78bfa', borderRadius:8, padding:'10px', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Apply Filters</button>
            <button onClick={() => { setSkill(''); setMinRate(''); setMaxRate(''); setLocation(''); setSearch(''); setRole(''); setPage(1); }} style={{ width:'100%', background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', borderRadius:8, padding:'8px', fontSize:12, cursor:'pointer', marginTop:6, fontFamily:'DM Sans,sans-serif' }}>Clear All</button>
          </div>

          {/* Post project CTA */}
          <div style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:12, padding:18, marginTop:16, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🚀</div>
            <h4 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, marginBottom:6 }}>Need help?</h4>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginBottom:12, lineHeight:1.5 }}>Post a project and get proposals from experts</p>
            <Link to="/post-project" style={{ display:'block', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', textDecoration:'none', padding:'9px', borderRadius:8, fontWeight:700, fontSize:12 }}>Post a Project →</Link>
          </div>
        </div>

        {/* Talent grid */}
        <div>
          {loading ? (
            <div style={{ textAlign:'center', padding:60, color:'#7c3aed' }}>Finding talent...</div>
          ) : users.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:48, marginBottom:14 }}>👥</div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:20, marginBottom:8 }}>No talent found</h3>
              <p style={{ color:'rgba(255,255,255,0.4)' }}>Try different filters or invite someone to join</p>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                {users.map(u => (
                  <div key={u._id} onClick={() => setSelected(selected?._id===u._id?null:u)} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${selected?._id===u._id?'rgba(124,58,237,0.5)':'rgba(255,255,255,0.07)'}`, borderRadius:14, padding:20, cursor:'pointer', transition:'all 0.2s', position:'relative' }}
                    onMouseEnter={e => { if(selected?._id!==u._id) e.currentTarget.style.borderColor='rgba(124,58,237,0.3)'; }}
                    onMouseLeave={e => { if(selected?._id!==u._id) e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}>

                    {u.isVerified && <div style={{ position:'absolute', top:12, right:12, background:'rgba(74,222,128,0.15)', color:'#4ade80', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:10 }}>✓ Verified</div>}

                    <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                      {u.photo
                        ? <img src={u.photo} alt="" style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(124,58,237,0.4)', flexShrink:0 }} />
                        : <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(124,58,237,0.2)', border:'2px solid rgba(124,58,237,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#a78bfa', flexShrink:0 }}>{u.name?.[0]?.toUpperCase()}</div>
                      }
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#fff', marginBottom:2 }}>{u.name}</div>
                        <div style={{ fontSize:12, color:'#a78bfa', fontWeight:600, marginBottom:3, textTransform:'capitalize' }}>{ROLE_LABELS[u.primaryRole]||u.primaryRole}</div>
                        {u.city && <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>📍 {u.city}</div>}
                      </div>
                    </div>

                    {u.headline && <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12, lineHeight:1.5, marginBottom:10 }}>{u.headline}</p>}

                    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
                      {(u.skills||[]).slice(0,4).map(s => (
                        <span key={s.name} style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', color:'#a78bfa', fontSize:10, padding:'2px 8px', borderRadius:10 }}>{s.name}</span>
                      ))}
                    </div>

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ display:'flex', gap:14 }}>
                        {u.rating > 0 && <div style={{ textAlign:'center' }}><div style={{ fontSize:13, fontWeight:700, color:gold }}>★ {u.rating}</div><div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{u.reviewCount} reviews</div></div>}
                        {u.hourlyRate > 0 && <div style={{ textAlign:'center' }}><div style={{ fontSize:13, fontWeight:700, color:'#4ade80' }}>₹{u.hourlyRate}/hr</div><div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>Hourly Rate</div></div>}
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <Link to={`/talent/${u._id}`} onClick={e => e.stopPropagation()} style={{ background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', color:'#a78bfa', padding:'7px 12px', borderRadius:8, textDecoration:'none', fontSize:12, fontWeight:600 }}>View</Link>
                        <Link to={`/messages?to=${u._id}`} onClick={e => e.stopPropagation()} style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', padding:'7px 12px', borderRadius:8, textDecoration:'none', fontSize:12, fontWeight:600 }}>Hire</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {total > 12 && (
                <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:24 }}>
                  {page > 1 && <button onClick={() => setPage(p=>p-1)} style={pgBtn}>← Prev</button>}
                  <span style={{ padding:'9px 16px', color:'rgba(255,255,255,0.5)', fontSize:13 }}>Page {page} of {Math.ceil(total/12)}</span>
                  {page < Math.ceil(total/12) && <button onClick={() => setPage(p=>p+1)} style={pgBtn}>Next →</button>}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

const gold = '#d4a853';
const ls  = { display:'block', fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:5, textTransform:'uppercase', letterSpacing:1 };
const selS = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 10px', color:'#fff', fontSize:12, outline:'none', fontFamily:'DM Sans,sans-serif' };
const pgBtn = { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', borderRadius:8, padding:'9px 18px', cursor:'pointer', fontSize:13, fontFamily:'DM Sans,sans-serif' };
