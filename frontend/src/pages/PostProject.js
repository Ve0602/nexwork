import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CATEGORIES = ['AI & Machine Learning','Web Development','Data Science','Mobile Development','Design & Creative','Content Writing','Tailoring & Fashion','Photography','Home Services','Teaching','Other'];
const SKILLS_LIST = ['Python','JavaScript','React','Node.js','AI/ML','Prompt Engineering','Data Annotation','Graphic Design','Content Writing','Tailoring','Photography','SEO','Video Editing','3D Modeling'];
const DURATIONS = ['Less than 1 week','1-2 weeks','2-4 weeks','1-3 months','3-6 months','More than 6 months'];

export default function PostProject() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title:'', category:'', description:'', skills:[],
    budget:{ min:'', max:'', type:'fixed' },
    duration:'', visibility:'public', tags:[]
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const addSkill = (s) => {
    if (s && !form.skills.includes(s)) f('skills',[...form.skills,s]);
    setSkillInput('');
  };
  const removeSkill = (s) => f('skills',form.skills.filter(x=>x!==s));

  const submit = async () => {
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/api/projects`, { ...form, budget:{ min:parseInt(form.budget.min)||0, max:parseInt(form.budget.max)||0, type:form.budget.type } }, { headers:{ Authorization:`Bearer ${token}` } });
      setDone(true);
    } catch(e) { setError(e.response?.data?.message||'Failed to post project'); }
    finally { setLoading(false); }
  };

  const gold = '#d4a853';
  const STEPS = ['Project Info','Budget','Review & Post'];

  if (done) return (
    <div style={{ background:'#07070f', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', paddingTop:64 }}>
      <div style={{ textAlign:'center', maxWidth:480, padding:40 }}>
        <div style={{ fontSize:64, marginBottom:20 }}>🎉</div>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:28, color:'#fff', marginBottom:12 }}>Project Posted!</h2>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, lineHeight:1.8, marginBottom:28 }}>Your project is now live. Freelancers will start sending proposals shortly.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:9, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>View Dashboard →</button>
          <button onClick={() => { setDone(false); setStep(1); setForm({ title:'', category:'', description:'', skills:[], budget:{ min:'', max:'', type:'fixed' }, duration:'', visibility:'public', tags:[] }); }} style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'rgba(255,255,255,0.6)', borderRadius:9, padding:'12px 24px', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Post Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ maxWidth:680, margin:'0 auto', padding:'40px 20px' }}>

        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:28, marginBottom:6 }}>Post a Project</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:28 }}>Find the perfect freelancer for your project</p>

        {/* Steps */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
          {STEPS.map((s,i) => (
            <div key={s} style={{ display:'flex', alignItems:'center', flex: i<STEPS.length-1?1:'none' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:step>i+1?gold:step===i+1?`linear-gradient(135deg,${gold},#b8860b)`:'rgba(255,255,255,0.08)', border:`2px solid ${step>=i+1?gold:'rgba(255,255,255,0.12)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:step>=i+1?'#000':'rgba(255,255,255,0.3)', fontFamily:'Syne,sans-serif' }}>{step>i+1?'✓':i+1}</div>
                <div style={{ fontSize:10, color:step===i+1?gold:'rgba(255,255,255,0.3)', whiteSpace:'nowrap' }}>{s}</div>
              </div>
              {i<STEPS.length-1 && <div style={{ flex:1, height:2, background:step>i+1?gold:'rgba(255,255,255,0.08)', margin:'0 8px 18px' }} />}
            </div>
          ))}
        </div>

        {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', color:'#f87171', fontSize:13, marginBottom:16 }}>{error}</div>}

        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:28 }}>

          {/* STEP 1 */}
          {step===1 && (
            <div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:18, marginBottom:20 }}>Tell us about your project</h3>
              <div style={{ display:'grid', gap:16 }}>
                <FI label="Project Title *" value={form.title} onChange={v=>f('title',v)} placeholder="e.g. Build an AI chatbot for my website" />
                <div>
                  <label style={ls}>Category *</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {CATEGORIES.map(c => (
                      <button key={c} type="button" onClick={()=>f('category',c)} style={{ padding:'8px 14px', borderRadius:20, border:`1px solid ${form.category===c?gold:'rgba(255,255,255,0.1)'}`, background:form.category===c?`${gold}18`:'transparent', color:form.category===c?gold:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>{c}</button>
                    ))}
                  </div>
                </div>
                <FI label="Project Description *" value={form.description} onChange={v=>f('description',v)} textarea placeholder="Describe what you need in detail. Include goals, features, and any specific requirements..." />
                <div>
                  <label style={ls}>Required Skills</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                    {form.skills.map(s => <span key={s} style={{ background:`${gold}18`, border:`1px solid ${gold}35`, color:gold, fontSize:12, padding:'4px 10px', borderRadius:20, display:'flex', alignItems:'center', gap:5 }}>{s}<button onClick={()=>removeSkill(s)} style={{ background:'none', border:'none', color:gold, cursor:'pointer', fontSize:14 }}>×</button></span>)}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill(skillInput))} placeholder="Type skill and press Enter" style={{ ...inp, flex:1 }} />
                    <button onClick={()=>addSkill(skillInput)} style={{ background:gold, color:'#000', border:'none', borderRadius:8, padding:'0 16px', fontWeight:700, cursor:'pointer' }}>Add</button>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:8 }}>
                    {SKILLS_LIST.filter(s=>!form.skills.includes(s)).slice(0,6).map(s => (
                      <button key={s} onClick={()=>addSkill(s)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontSize:11, padding:'3px 10px', borderRadius:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>+ {s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={ls}>Project Duration</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {DURATIONS.map(d => (
                      <button key={d} type="button" onClick={()=>f('duration',d)} style={{ padding:'7px 14px', borderRadius:20, border:`1px solid ${form.duration===d?gold:'rgba(255,255,255,0.1)'}`, background:form.duration===d?`${gold}18`:'transparent', color:form.duration===d?gold:'rgba(255,255,255,0.4)', fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>{d}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step===2 && (
            <div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:18, marginBottom:20 }}>Budget & Visibility</h3>
              <div style={{ display:'grid', gap:16 }}>
                <div>
                  <label style={ls}>Payment Type</label>
                  <div style={{ display:'flex', gap:10 }}>
                    {['fixed','hourly'].map(t => (
                      <button key={t} onClick={()=>f('budget',{...form.budget,type:t})} style={{ flex:1, padding:'12px', border:`2px solid ${form.budget.type===t?gold:'rgba(255,255,255,0.1)'}`, background:form.budget.type===t?`${gold}18`:'transparent', color:form.budget.type===t?gold:'rgba(255,255,255,0.5)', borderRadius:9, cursor:'pointer', fontWeight:600, fontSize:14, fontFamily:'DM Sans,sans-serif', textTransform:'capitalize' }}>{t==='fixed'?'💰 Fixed Price':'⏱ Hourly Rate'}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <FI label={`Min Budget (₹) ${form.budget.type==='hourly'?'/hr':''}`} value={form.budget.min} onChange={v=>f('budget',{...form.budget,min:v})} type="number" placeholder="e.g. 5000" />
                  <FI label={`Max Budget (₹) ${form.budget.type==='hourly'?'/hr':''}`} value={form.budget.max} onChange={v=>f('budget',{...form.budget,max:v})} type="number" placeholder="e.g. 25000" />
                </div>
                <div>
                  <label style={ls}>Visibility</label>
                  <div style={{ display:'flex', gap:10 }}>
                    {[['public','🌍 Public - Anyone can see'],['private','🔒 Private - Invite only']].map(([v,l]) => (
                      <button key={v} onClick={()=>f('visibility',v)} style={{ flex:1, padding:'11px', border:`2px solid ${form.visibility===v?'#7c3aed':'rgba(255,255,255,0.1)'}`, background:form.visibility===v?'rgba(124,58,237,0.15)':'transparent', color:form.visibility===v?'#a78bfa':'rgba(255,255,255,0.5)', borderRadius:9, cursor:'pointer', fontWeight:500, fontSize:13, fontFamily:'DM Sans,sans-serif' }}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 - Review */}
          {step===3 && (
            <div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:18, marginBottom:20 }}>Review & Post</h3>
              <div style={{ background:'rgba(212,168,83,0.06)', border:'1px solid rgba(212,168,83,0.15)', borderRadius:10, padding:18, marginBottom:16 }}>
                {[['📋 Title',form.title],['📂 Category',form.category],['💰 Budget',`₹${form.budget.min} – ₹${form.budget.max} (${form.budget.type})`],['⏱ Duration',form.duration||'Flexible'],['🌍 Visibility',form.visibility]].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color:'rgba(255,255,255,0.4)', fontSize:13, minWidth:120 }}>{k}</span>
                    <span style={{ color:'#fff', fontSize:13, fontWeight:500 }}>{v}</span>
                  </div>
                ))}
                <div style={{ padding:'8px 0' }}>
                  <span style={{ color:'rgba(255,255,255,0.4)', fontSize:13, display:'block', marginBottom:6 }}>🛠 Skills</span>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>{form.skills.map(s=><span key={s} style={{ background:'rgba(99,102,241,0.1)', color:'#a78bfa', fontSize:11, padding:'2px 8px', borderRadius:10 }}>{s}</span>)}</div>
                </div>
              </div>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, lineHeight:1.7 }}>By posting, your project goes live immediately and freelancers can start submitting proposals.</p>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:24 }}>
            {step>1 ? <button onClick={()=>setStep(s=>s-1)} style={btnOut}>← Back</button> : <div />}
            {step<3
              ? <button onClick={()=>setStep(s=>s+1)} disabled={step===1&&(!form.title||!form.category||!form.description)} style={{ ...btnGold, opacity:(step===1&&(!form.title||!form.category||!form.description))?0.4:1, cursor:(step===1&&(!form.title||!form.category||!form.description))?'not-allowed':'pointer' }}>Continue →</button>
              : <button onClick={submit} disabled={loading} style={{ ...btnGold, opacity:loading?0.7:1 }}>{loading?'Posting...':'🚀 Post Project'}</button>
            }
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
    {textarea
      ? <textarea value={value||''} onChange={e=>onChange(e.target.value)} rows={4} placeholder={placeholder} style={{...inp,resize:'vertical'}} />
      : <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inp} />}
  </div>
);
const ls = { display:'block', fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 };
const inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'11px 13px', color:'#fff', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif' };
const gold = '#d4a853';
const btnGold = { background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:9, padding:'12px 26px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif' };
const btnOut = { background:'transparent', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'12px 24px', fontWeight:500, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif' };
