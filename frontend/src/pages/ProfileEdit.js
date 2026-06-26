import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SKILL_SUGGESTIONS = ['Python','JavaScript','React','Node.js','AI/ML','Prompt Engineering','Data Annotation','Graphic Design','Content Writing','Tailoring','Photography','SEO','Video Editing','Data Science','Machine Learning','MongoDB','Express.js','TypeScript'];

export default function ProfileEdit() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('basic');
  const [form, setForm] = useState({ name:'', headline:'', bio:'', phone:'', city:'', state:'', country:'India', hourlyRate:'', availability:'available', linkedinUrl:'', githubUrl:'', websiteUrl:'', skills:[], experience:[], education:[] });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [newExp, setNewExp] = useState({ title:'', company:'', from:'', to:'', current:false, desc:'' });
  const [newEdu, setNewEdu] = useState({ degree:'', institution:'', year:'', grade:'' });

  useEffect(() => {
    if (user) setForm({ name:user.name||'', headline:user.headline||'', bio:user.bio||'', phone:user.phone||'', city:user.city||'', state:user.state||'', country:user.country||'India', hourlyRate:user.hourlyRate||'', availability:user.availability||'available', linkedinUrl:user.linkedinUrl||'', githubUrl:user.githubUrl||'', websiteUrl:user.websiteUrl||'', skills:user.skills||[], experience:user.experience||[], education:user.education||[] });
  }, [user]);

  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const addSkill = (s) => { if (!s.trim()) return; if (!form.skills.find(x=>x.name===s.trim())) f('skills',[...form.skills,{ name:s.trim(), level:'Intermediate', verified:false }]); setSkillInput(''); };
  const removeSkill = (name) => f('skills', form.skills.filter(s=>s.name!==name));
  const updateSkillLevel = (name, level) => f('skills', form.skills.map(s => s.name===name ? {...s,level} : s));
  const addExperience = () => { if (!newExp.title||!newExp.company) return; f('experience', [...form.experience, newExp]); setNewExp({ title:'', company:'', from:'', to:'', current:false, desc:'' }); };
  const removeExp = (i) => f('experience', form.experience.filter((_,idx)=>idx!==i));
  const addEducation = () => { if (!newEdu.degree||!newEdu.institution) return; f('education', [...form.education, newEdu]); setNewEdu({ degree:'', institution:'', year:'', grade:'' }); };
  const removeEdu = (i) => f('education', form.education.filter((_,idx)=>idx!==i));

  const save = async () => {
    setLoading(true); setMsg('');
    try {
      const { data } = await axios.put(`${API}/api/auth/profile`, form, { headers:{ Authorization:`Bearer ${token}` } });
      updateUser(data.user);
      setMsg('Profile saved');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch(e) { setMsg(e.response?.data?.message||'Save failed'); }
    finally { setLoading(false); }
  };

  const tabs = [['basic','Basic info'],['skills','Skills'],['experience','Experience'],['education','Education'],['social','Social links']];
  if (!user) return null;

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth:700, margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Edit profile</h1>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">← Back</button>
        </div>

        {msg && <div className="card" style={{ padding:'10px 14px', marginBottom:16, fontSize:13 }}>{msg}</div>}

        <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid var(--border)', flexWrap:'wrap' }}>
          {tabs.map(([id,label]) => (
            <button key={id} onClick={()=>setTab(id)} style={{ padding:'10px 14px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:500, color: tab===id?'var(--accent)':'var(--text-muted)', borderBottom: tab===id?'2px solid var(--accent)':'2px solid transparent' }}>{label}</button>
          ))}
        </div>

        <div className="card" style={{ padding: 24 }}>

          {tab==='basic' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <FI label="Full name" value={form.name} onChange={v=>f('name',v)} span={2} />
              <FI label="Professional headline" value={form.headline} onChange={v=>f('headline',v)} placeholder="e.g. AI Prompt Engineer" span={2} />
              <FI label="Bio" value={form.bio} onChange={v=>f('bio',v)} textarea placeholder="Tell clients about yourself…" span={2} />
              <FI label="Phone" value={form.phone} onChange={v=>f('phone',v)} />
              <div><label style={ls}>Availability</label><select value={form.availability} onChange={e=>f('availability',e.target.value)} className="input"><option value="available">Available</option><option value="busy">Busy</option><option value="unavailable">Unavailable</option></select></div>
              <FI label="Hourly rate (₹)" value={form.hourlyRate} onChange={v=>f('hourlyRate',v)} type="number" />
              <FI label="City" value={form.city} onChange={v=>f('city',v)} />
              <FI label="State" value={form.state} onChange={v=>f('state',v)} />
              <div><label style={ls}>Country</label><select value={form.country} onChange={e=>f('country',e.target.value)} className="input"><option>India</option><option>United States</option><option>United Kingdom</option><option>Other</option></select></div>
            </div>
          )}

          {tab==='skills' && (
            <div>
              {form.skills.length > 0 && (
                <div style={{ marginBottom:18 }}>
                  {form.skills.map(s => (
                    <div key={s.name} className="card" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', marginBottom:8 }}>
                      <span style={{ flex:1, fontWeight:500, fontSize:13 }}>{s.name}</span>
                      <select value={s.level} onChange={e=>updateSkillLevel(s.name,e.target.value)} className="input" style={{ width:'auto', padding:'5px 10px', fontSize:12 }}><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option></select>
                      <button onClick={()=>removeSkill(s.name)} className="btn btn-ghost" style={{ color:'var(--danger)' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill(skillInput))} placeholder="Type a skill and press Enter" className="input" />
                <button onClick={()=>addSkill(skillInput)} className="btn btn-primary">Add</button>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {SKILL_SUGGESTIONS.filter(s=>!form.skills.find(x=>x.name===s)).map(s => <button key={s} onClick={()=>addSkill(s)} className="tag" style={{ cursor:'pointer' }}>+ {s}</button>)}
              </div>
            </div>
          )}

          {tab==='experience' && (
            <div>
              {form.experience.map((exp,i) => (
                <div key={i} className="card" style={{ padding:'16px 18px', marginBottom:12, position:'relative' }}>
                  <button onClick={()=>removeExp(i)} className="btn btn-ghost" style={{ position:'absolute', top:12, right:12, color:'var(--danger)', fontSize:11 }}>Remove</button>
                  <div style={{ fontWeight:600, fontSize:14 }}>{exp.title}</div>
                  <div style={{ fontSize:13, color:'var(--accent)', marginBottom:4 }}>{exp.company}</div>
                  <div style={{ fontSize:12, color:'var(--text-faint)', marginBottom:exp.desc?8:0 }}>{exp.from} – {exp.current?'Present':exp.to}</div>
                  {exp.desc && <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{exp.desc}</p>}
                </div>
              ))}
              <div className="card" style={{ padding:18, background:'var(--bg-subtle)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <FI label="Job title" value={newExp.title} onChange={v=>setNewExp({...newExp,title:v})} />
                  <FI label="Company" value={newExp.company} onChange={v=>setNewExp({...newExp,company:v})} />
                  <FI label="From" value={newExp.from} onChange={v=>setNewExp({...newExp,from:v})} placeholder="Apr 2024" />
                  <FI label="To" value={newExp.to} onChange={v=>setNewExp({...newExp,to:v})} placeholder="Present" />
                  <FI label="Description" value={newExp.desc} onChange={v=>setNewExp({...newExp,desc:v})} textarea span={2} />
                </div>
                <button onClick={addExperience} disabled={!newExp.title||!newExp.company} className="btn btn-primary">Add experience</button>
              </div>
            </div>
          )}

          {tab==='education' && (
            <div>
              {form.education.map((edu,i) => (
                <div key={i} className="card" style={{ padding:'16px 18px', marginBottom:12, position:'relative' }}>
                  <button onClick={()=>removeEdu(i)} className="btn btn-ghost" style={{ position:'absolute', top:12, right:12, color:'var(--danger)', fontSize:11 }}>Remove</button>
                  <div style={{ fontWeight:600, fontSize:14 }}>{edu.degree}</div>
                  <div style={{ fontSize:13, color:'var(--accent)' }}>{edu.institution}</div>
                  <div style={{ fontSize:12, color:'var(--text-faint)' }}>{edu.year} {edu.grade&&`· ${edu.grade}`}</div>
                </div>
              ))}
              <div className="card" style={{ padding:18, background:'var(--bg-subtle)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <FI label="Degree" value={newEdu.degree} onChange={v=>setNewEdu({...newEdu,degree:v})} />
                  <FI label="Institution" value={newEdu.institution} onChange={v=>setNewEdu({...newEdu,institution:v})} />
                  <FI label="Year" value={newEdu.year} onChange={v=>setNewEdu({...newEdu,year:v})} type="number" />
                  <FI label="Grade" value={newEdu.grade} onChange={v=>setNewEdu({...newEdu,grade:v})} />
                </div>
                <button onClick={addEducation} disabled={!newEdu.degree||!newEdu.institution} className="btn btn-primary">Add education</button>
              </div>
            </div>
          )}

          {tab==='social' && (
            <div style={{ display:'grid', gap:16 }}>
              <FI label="LinkedIn URL" value={form.linkedinUrl} onChange={v=>f('linkedinUrl',v)} />
              <FI label="GitHub URL" value={form.githubUrl} onChange={v=>f('githubUrl',v)} />
              <FI label="Website URL" value={form.websiteUrl} onChange={v=>f('websiteUrl',v)} />
            </div>
          )}

          <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
            <button onClick={save} disabled={loading} className="btn btn-primary">{loading ? 'Saving…' : 'Save profile'}</button>
            <button onClick={()=>navigate('/dashboard')} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FI = ({label,value,onChange,type='text',placeholder,textarea,span}) => (
  <div style={span===2?{gridColumn:'1/-1'}:{}}>
    <label style={ls}>{label}</label>
    {textarea ? <textarea value={value||''} onChange={e=>onChange(e.target.value)} rows={3} placeholder={placeholder} className="input" style={{ resize:'vertical' }} /> : <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="input" />}
  </div>
);
const ls = { display:'block', fontSize:11, color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' };
