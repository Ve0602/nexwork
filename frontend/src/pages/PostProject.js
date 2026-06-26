import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

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

  const addSkill = (s) => { if (s && !form.skills.includes(s)) f('skills',[...form.skills,s]); setSkillInput(''); };
  const removeSkill = (s) => f('skills',form.skills.filter(x=>x!==s));

  const submit = async () => {
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/api/projects`, { ...form, budget:{ min:parseInt(form.budget.min)||0, max:parseInt(form.budget.max)||0, type:form.budget.type } }, { headers:{ Authorization:`Bearer ${token}` } });
      setDone(true);
    } catch(e) { setError(e.response?.data?.message||'Failed to post project'); }
    finally { setLoading(false); }
  };

  const STEPS = ['Project info','Budget','Review'];

  if (done) return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'70vh', textAlign:'center', padding:40 }}>
        <div style={{ maxWidth:420 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>Project posted</h2>
          <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.7, marginBottom:24 }}>Your project is live. Freelancers can now submit proposals.</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">View dashboard</button>
            <button onClick={() => { setDone(false); setStep(1); setForm({ title:'', category:'', description:'', skills:[], budget:{ min:'', max:'', type:'fixed' }, duration:'', visibility:'public', tags:[] }); }} className="btn btn-secondary">Post another</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth:640, margin:'0 auto', padding:'32px 24px' }}>

        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Post a project</h1>
        <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:24 }}>Find the right freelancer for your work</p>

        <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
          {STEPS.map((s,i) => (
            <div key={s} style={{ display:'flex', alignItems:'center', flex: i<STEPS.length-1?1:'none' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div className="mono" style={{ width:28, height:28, borderRadius:'50%', background: step>i+1?'var(--accent)':step===i+1?'var(--accent)':'var(--bg-subtle)', border:`1px solid ${step>=i+1?'var(--accent)':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:step>=i+1?'#fff':'var(--text-faint)' }}>{step>i+1?'✓':i+1}</div>
                <div style={{ fontSize:10, color:step===i+1?'var(--accent)':'var(--text-faint)', whiteSpace:'nowrap' }}>{s}</div>
              </div>
              {i<STEPS.length-1 && <div style={{ flex:1, height:1, background:step>i+1?'var(--accent)':'var(--border)', margin:'0 8px 16px' }} />}
            </div>
          ))}
        </div>

        {error && <div className="card" style={{ padding:'10px 14px', marginBottom:16, fontSize:13, color:'var(--danger)' }}>{error}</div>}

        <div className="card" style={{ padding: 24 }}>

          {step===1 && (
            <div style={{ display:'grid', gap:16 }}>
              <FI label="Project title" value={form.title} onChange={v=>f('title',v)} placeholder="e.g. Build an AI chatbot for my website" />
              <div>
                <label style={ls}>Category</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {CATEGORIES.map(c => (
                    <button key={c} type="button" onClick={()=>f('category',c)} className="tag" style={{ cursor:'pointer', background: form.category===c?'var(--accent-subtle)':'var(--bg)', color: form.category===c?'var(--accent)':'var(--text-muted)', border:`1px solid ${form.category===c?'transparent':'var(--border)'}` }}>{c}</button>
                  ))}
                </div>
              </div>
              <FI label="Project description" value={form.description} onChange={v=>f('description',v)} textarea placeholder="Describe what you need, goals and requirements…" />
              <div>
                <label style={ls}>Required skills</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                  {form.skills.map(s => <span key={s} className="tag tag-accent" style={{ display:'flex', alignItems:'center', gap:5 }}>{s}<button onClick={()=>removeSkill(s)} style={{ background:'none', border:'none', color:'inherit', cursor:'pointer' }}>×</button></span>)}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill(skillInput))} placeholder="Type skill and press Enter" className="input" />
                  <button onClick={()=>addSkill(skillInput)} className="btn btn-secondary">Add</button>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:8 }}>
                  {SKILLS_LIST.filter(s=>!form.skills.includes(s)).slice(0,6).map(s => (
                    <button key={s} onClick={()=>addSkill(s)} className="tag" style={{ cursor:'pointer' }}>+ {s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={ls}>Duration</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {DURATIONS.map(d => (
                    <button key={d} type="button" onClick={()=>f('duration',d)} className="tag" style={{ cursor:'pointer', background: form.duration===d?'var(--accent-subtle)':'var(--bg)', color: form.duration===d?'var(--accent)':'var(--text-muted)', border:`1px solid ${form.duration===d?'transparent':'var(--border)'}` }}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step===2 && (
            <div style={{ display:'grid', gap:16 }}>
              <div>
                <label style={ls}>Payment type</label>
                <div style={{ display:'flex', gap:10 }}>
                  {['fixed','hourly'].map(t => (
                    <button key={t} onClick={()=>f('budget',{...form.budget,type:t})} className="btn" style={{ flex:1, border: `1px solid ${form.budget.type===t?'var(--accent)':'var(--border)'}`, background: form.budget.type===t?'var(--accent-subtle)':'transparent', color: form.budget.type===t?'var(--accent)':'var(--text-muted)', textTransform:'capitalize' }}>{t==='fixed'?'Fixed price':'Hourly rate'}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FI label={`Min budget (₹)`} value={form.budget.min} onChange={v=>f('budget',{...form.budget,min:v})} type="number" placeholder="5000" />
                <FI label={`Max budget (₹)`} value={form.budget.max} onChange={v=>f('budget',{...form.budget,max:v})} type="number" placeholder="25000" />
              </div>
              <div>
                <label style={ls}>Visibility</label>
                <div style={{ display:'flex', gap:10 }}>
                  {[['public','Public'],['private','Private']].map(([v,l]) => (
                    <button key={v} onClick={()=>f('visibility',v)} className="btn" style={{ flex:1, border: `1px solid ${form.visibility===v?'var(--accent)':'var(--border)'}`, background: form.visibility===v?'var(--accent-subtle)':'transparent', color: form.visibility===v?'var(--accent)':'var(--text-muted)' }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step===3 && (
            <div>
              <div className="card" style={{ padding: 16, background:'var(--bg-subtle)', marginBottom: 16 }}>
                {[['Title',form.title],['Category',form.category],['Budget',`₹${form.budget.min}–₹${form.budget.max} (${form.budget.type})`],['Duration',form.duration||'Flexible'],['Visibility',form.visibility]].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', gap:12, padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ color:'var(--text-faint)', fontSize:12, minWidth:100 }}>{k}</span>
                    <span style={{ color:'var(--text)', fontSize:12, fontWeight:500 }}>{v}</span>
                  </div>
                ))}
                <div style={{ padding:'7px 0' }}>
                  <span style={{ color:'var(--text-faint)', fontSize:12, display:'block', marginBottom:6 }}>Skills</span>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>{form.skills.map(s=><span key={s} className="tag">{s}</span>)}</div>
                </div>
              </div>
              <p style={{ color:'var(--text-faint)', fontSize:12, lineHeight:1.6 }}>By posting, your project goes live immediately and freelancers can start submitting proposals.</p>
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:20 }}>
            {step>1 ? <button onClick={()=>setStep(s=>s-1)} className="btn btn-secondary">← Back</button> : <div />}
            {step<3
              ? <button onClick={()=>setStep(s=>s+1)} disabled={step===1&&(!form.title||!form.category||!form.description)} className="btn btn-primary" style={{ opacity:(step===1&&(!form.title||!form.category||!form.description))?0.4:1 }}>Continue →</button>
              : <button onClick={submit} disabled={loading} className="btn btn-primary">{loading?'Posting…':'Post project'}</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

const FI = ({label,value,onChange,type='text',placeholder,textarea}) => (
  <div>
    <label style={ls}>{label}</label>
    {textarea ? <textarea value={value||''} onChange={e=>onChange(e.target.value)} rows={4} placeholder={placeholder} className="input" style={{ resize:'vertical' }} />
    : <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="input" />}
  </div>
);
const ls = { display:'block', fontSize:11, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' };
