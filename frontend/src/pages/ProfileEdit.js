import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SKILL_SUGGESTIONS = ['Python','JavaScript','React','Node.js','AI/ML','Prompt Engineering','Data Annotation','Graphic Design','Content Writing','Tailoring','Photography','SEO','Video Editing','Data Science','Machine Learning','MongoDB','Express.js','TypeScript','Flutter','Django'];

export default function ProfileEdit() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('basic');
  const [form, setForm] = useState({
    name:'', headline:'', bio:'', phone:'', city:'', state:'', country:'India',
    hourlyRate:'', availability:'available', linkedinUrl:'', githubUrl:'', websiteUrl:'',
    skills:[], experience:[], education:[]
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [newExp, setNewExp] = useState({ title:'', company:'', from:'', to:'', current:false, desc:'' });
  const [newEdu, setNewEdu] = useState({ degree:'', institution:'', year:'', grade:'' });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name||'',
        headline: user.headline||'',
        bio: user.bio||'',
        phone: user.phone||'',
        city: user.city||'',
        state: user.state||'',
        country: user.country||'India',
        hourlyRate: user.hourlyRate||'',
        availability: user.availability||'available',
        linkedinUrl: user.linkedinUrl||'',
        githubUrl: user.githubUrl||'',
        websiteUrl: user.websiteUrl||'',
        skills: user.skills||[],
        experience: user.experience||[],
        education: user.education||[],
      });
    }
  }, [user]);

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const addSkill = (s) => {
    if (!s.trim()) return;
    if (!form.skills.find(x=>x.name===s.trim())) {
      f('skills',[...form.skills,{ name:s.trim(), level:'Intermediate', verified:false }]);
    }
    setSkillInput('');
  };

  const removeSkill = (name) => f('skills', form.skills.filter(s=>s.name!==name));

  const updateSkillLevel = (name, level) => {
    f('skills', form.skills.map(s => s.name===name ? {...s,level} : s));
  };

  const addExperience = () => {
    if (!newExp.title||!newExp.company) return;
    f('experience', [...form.experience, newExp]);
    setNewExp({ title:'', company:'', from:'', to:'', current:false, desc:'' });
  };

  const removeExp = (i) => f('experience', form.experience.filter((_,idx)=>idx!==i));

  const addEducation = () => {
    if (!newEdu.degree||!newEdu.institution) return;
    f('education', [...form.education, newEdu]);
    setNewEdu({ degree:'', institution:'', year:'', grade:'' });
  };

  const removeEdu = (i) => f('education', form.education.filter((_,idx)=>idx!==i));

  const save = async () => {
    setLoading(true); setMsg('');
    try {
      const { data } = await axios.put(`${API}/api/auth/profile`, form, { headers:{ Authorization:`Bearer ${token}` } });
      updateUser(data.user);
      setMsg('✅ Profile saved successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch(e) { setMsg('❌ '+(e.response?.data?.message||'Save failed')); }
    finally { setLoading(false); }
  };

  const gold = '#d4a853';
  const tabs = [['basic','👤 Basic Info'],['skills','🛠 Skills'],['experience','💼 Experience'],['education','🎓 Education'],['social','🔗 Social Links']];

  if (!user) return null;

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ maxWidth:760, margin:'0 auto', padding:'40px 20px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:28 }}>Edit Profile</h1>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginTop:4 }}>Keep your profile updated to get more opportunities</p>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'rgba(255,255,255,0.5)', borderRadius:9, padding:'9px 18px', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:13 }}>← Back</button>
        </div>

        {msg && <div style={{ background:msg.startsWith('✅')?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:8, padding:'10px 14px', color:msg.startsWith('✅')?'#4ade80':'#f87171', fontSize:13, marginBottom:20 }}>{msg}</div>}

        {/* Tab bar */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:12, padding:4, marginBottom:24, gap:4, flexWrap:'wrap' }}>
          {tabs.map(([id,label]) => (
            <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:'10px 8px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:600, background:tab===id?'rgba(255,255,255,0.08)':'transparent', color:tab===id?'#fff':'rgba(255,255,255,0.4)', transition:'all 0.2s', whiteSpace:'nowrap' }}>{label}</button>
          ))}
        </div>

        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:28 }}>

          {/* BASIC INFO */}
          {tab==='basic' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <FI label="Full Name *" value={form.name} onChange={v=>f('name',v)} span={2} />
              <FI label="Professional Headline" value={form.headline} onChange={v=>f('headline',v)} placeholder="e.g. AI Prompt Engineer | Full Stack Developer" span={2} />
              <FI label="Bio / About" value={form.bio} onChange={v=>f('bio',v)} textarea placeholder="Tell clients about yourself, your expertise, and what makes you unique..." span={2} />
              <FI label="Phone" value={form.phone} onChange={v=>f('phone',v)} placeholder="+91 99999 99999" />
              <div>
                <label style={ls}>Availability</label>
                <select value={form.availability} onChange={e=>f('availability',e.target.value)} style={is}>
                  <option value="available">✅ Available for Work</option>
                  <option value="busy">⚡ Busy but Open</option>
                  <option value="unavailable">⛔ Not Available</option>
                </select>
              </div>
              <FI label="Hourly Rate (₹)" value={form.hourlyRate} onChange={v=>f('hourlyRate',v)} type="number" placeholder="e.g. 500" />
              <FI label="City" value={form.city} onChange={v=>f('city',v)} placeholder="Warangal" />
              <FI label="State" value={form.state} onChange={v=>f('state',v)} placeholder="Telangana" />
              <div>
                <label style={ls}>Country</label>
                <select value={form.country} onChange={e=>f('country',e.target.value)} style={is}>
                  <option>India</option><option>United States</option><option>United Kingdom</option><option>Canada</option><option>Australia</option><option>Other</option>
                </select>
              </div>
            </div>
          )}

          {/* SKILLS */}
          {tab==='skills' && (
            <div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:16 }}>Your Skills</h3>

              {/* Existing skills */}
              {form.skills.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  {form.skills.map(s => (
                    <div key={s.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, marginBottom:8 }}>
                      <span style={{ flex:1, fontWeight:600, fontSize:14 }}>{s.name}</span>
                      <select value={s.level} onChange={e=>updateSkillLevel(s.name,e.target.value)} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:7, padding:'5px 10px', color:'#fff', fontSize:12, outline:'none', fontFamily:'DM Sans,sans-serif' }}>
                        <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                      </select>
                      <button onClick={()=>removeSkill(s.name)} style={{ background:'rgba(239,68,68,0.1)', border:'none', color:'#f87171', borderRadius:7, padding:'5px 10px', cursor:'pointer', fontSize:13 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add skill */}
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill(skillInput))} placeholder="Type a skill and press Enter or click Add" style={{ ...is, flex:1 }} />
                <button onClick={()=>addSkill(skillInput)} style={{ background:gold, color:'#000', border:'none', borderRadius:8, padding:'0 20px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Add</button>
              </div>

              {/* Suggestions */}
              <div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Quick Add</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {SKILL_SUGGESTIONS.filter(s=>!form.skills.find(x=>x.name===s)).map(s => (
                    <button key={s} onClick={()=>addSkill(s)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', fontSize:12, padding:'5px 12px', borderRadius:16, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.2s' }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=gold;e.currentTarget.style.color=gold;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='rgba(255,255,255,0.6)';}}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EXPERIENCE */}
          {tab==='experience' && (
            <div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:16 }}>Work Experience</h3>

              {form.experience.map((exp,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'16px 18px', marginBottom:12, position:'relative' }}>
                  <button onClick={()=>removeExp(i)} style={{ position:'absolute', top:12, right:12, background:'rgba(239,68,68,0.1)', border:'none', color:'#f87171', borderRadius:6, padding:'4px 8px', cursor:'pointer', fontSize:12 }}>Remove</button>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#fff', marginBottom:2 }}>{exp.title}</div>
                  <div style={{ fontSize:13, color:gold, marginBottom:4 }}>{exp.company}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:exp.desc?8:0 }}>{exp.from} – {exp.current?'Present':exp.to}</div>
                  {exp.desc && <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>{exp.desc}</p>}
                </div>
              ))}

              <div style={{ background:'rgba(212,168,83,0.06)', border:`1px solid ${gold}25`, borderRadius:12, padding:20 }}>
                <h4 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, marginBottom:14, color:gold }}>+ Add Experience</h4>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <FI label="Job Title *" value={newExp.title} onChange={v=>setNewExp({...newExp,title:v})} placeholder="e.g. Prompt Engineer" />
                  <FI label="Company *" value={newExp.company} onChange={v=>setNewExp({...newExp,company:v})} placeholder="e.g. Centific" />
                  <FI label="From" value={newExp.from} onChange={v=>setNewExp({...newExp,from:v})} placeholder="Apr 2024" />
                  <FI label="To" value={newExp.to} onChange={v=>setNewExp({...newExp,to:v})} placeholder="Present" />
                  <FI label="Description" value={newExp.desc} onChange={v=>setNewExp({...newExp,desc:v})} textarea placeholder="Describe your role and achievements..." span={2} />
                </div>
                <button onClick={addExperience} disabled={!newExp.title||!newExp.company} style={{ marginTop:14, background:gold, color:'#000', border:'none', borderRadius:8, padding:'10px 24px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:(!newExp.title||!newExp.company)?0.5:1 }}>Add Experience</button>
              </div>
            </div>
          )}

          {/* EDUCATION */}
          {tab==='education' && (
            <div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:16 }}>Education</h3>

              {form.education.map((edu,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'16px 18px', marginBottom:12, position:'relative' }}>
                  <button onClick={()=>removeEdu(i)} style={{ position:'absolute', top:12, right:12, background:'rgba(239,68,68,0.1)', border:'none', color:'#f87171', borderRadius:6, padding:'4px 8px', cursor:'pointer', fontSize:12 }}>Remove</button>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#fff', marginBottom:2 }}>{edu.degree}</div>
                  <div style={{ fontSize:13, color:'#7c3aed', marginBottom:2 }}>{edu.institution}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{edu.year} {edu.grade&&`· ${edu.grade}`}</div>
                </div>
              ))}

              <div style={{ background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:12, padding:20 }}>
                <h4 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, marginBottom:14, color:'#a78bfa' }}>+ Add Education</h4>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <FI label="Degree *" value={newEdu.degree} onChange={v=>setNewEdu({...newEdu,degree:v})} placeholder="e.g. B.Tech Computer Science" />
                  <FI label="Institution *" value={newEdu.institution} onChange={v=>setNewEdu({...newEdu,institution:v})} placeholder="e.g. JNTUH" />
                  <FI label="Year" value={newEdu.year} onChange={v=>setNewEdu({...newEdu,year:v})} placeholder="2023" type="number" />
                  <FI label="Grade/CGPA" value={newEdu.grade} onChange={v=>setNewEdu({...newEdu,grade:v})} placeholder="e.g. 8.5 CGPA" />
                </div>
                <button onClick={addEducation} disabled={!newEdu.degree||!newEdu.institution} style={{ marginTop:14, background:'#7c3aed', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:(!newEdu.degree||!newEdu.institution)?0.5:1 }}>Add Education</button>
              </div>
            </div>
          )}

          {/* SOCIAL */}
          {tab==='social' && (
            <div style={{ display:'grid', gap:16 }}>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16 }}>Social & Portfolio Links</h3>
              <FI label="LinkedIn URL" value={form.linkedinUrl} onChange={v=>f('linkedinUrl',v)} placeholder="https://linkedin.com/in/your-profile" />
              <FI label="GitHub URL" value={form.githubUrl} onChange={v=>f('githubUrl',v)} placeholder="https://github.com/yourusername" />
              <FI label="Portfolio / Website URL" value={form.websiteUrl} onChange={v=>f('websiteUrl',v)} placeholder="https://yourwebsite.com" />
              <div style={{ background:'rgba(212,168,83,0.06)', border:`1px solid ${gold}20`, borderRadius:10, padding:'12px 16px', fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
                💡 Adding your LinkedIn and GitHub profiles increases your chances of getting hired by <strong style={{ color:gold }}>3x</strong>. Clients trust verified profiles!
              </div>
            </div>
          )}

          {/* Save button */}
          <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:10 }}>
            <button onClick={save} disabled={loading} style={{ background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:9, padding:'13px 32px', fontWeight:800, fontSize:15, cursor:loading?'not-allowed':'pointer', fontFamily:'Syne,sans-serif', opacity:loading?0.7:1 }}>
              {loading ? '⏳ Saving...' : '💾 Save Profile'}
            </button>
            <button onClick={()=>navigate('/dashboard')} style={{ background:'rgba(255,255,255,0.06)', border:'none', color:'rgba(255,255,255,0.5)', borderRadius:9, padding:'13px 24px', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Cancel</button>
          </div>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

const FI = ({label,value,onChange,type='text',placeholder,textarea,span}) => (
  <div style={span===2?{gridColumn:'1/-1'}:{}}>
    <label style={ls}>{label}</label>
    {textarea ? <textarea value={value||''} onChange={e=>onChange(e.target.value)} rows={3} placeholder={placeholder} style={{...is,resize:'vertical'}} />
    : <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={is} />}
  </div>
);

const gold = '#d4a853';
const ls = { display:'block', fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:5, textTransform:'uppercase', letterSpacing:1 };
const is = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'11px 13px', color:'#fff', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif' };
