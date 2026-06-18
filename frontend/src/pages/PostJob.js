import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SKILLS_LIST = ['Python','JavaScript','React','Node.js','AI/ML','Java','SQL','AWS','Docker','TypeScript','Communication','Leadership'];

export default function PostJob() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title:'', company:'', description:'', type:'fulltime', mode:'remote', location:'',
    skills:[], experience:{ min:'', max:'' }, salary:{ min:'', max:'', currency:'INR', period:'monthly' },
    openings:1, deadline:''
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const addSkill = (s) => { if(s.trim()&&!form.skills.includes(s.trim())) f('skills',[...form.skills,s.trim()]); setSkillInput(''); };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/api/jobs`, {
        ...form,
        experience:{ min:parseInt(form.experience.min)||0, max:parseInt(form.experience.max)||0 },
        salary:{ ...form.salary, min:parseInt(form.salary.min)||0, max:parseInt(form.salary.max)||0 },
        openings: parseInt(form.openings)||1
      }, { headers:{ Authorization:`Bearer ${token}` } });
      setDone(true);
    } catch(e) { setError(e.response?.data?.message||'Failed to post job'); }
    finally { setLoading(false); }
  };

  const green = '#10b981';

  if (done) return (
    <div style={{ background:'#07070f', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', paddingTop:64 }}>
      <div style={{ textAlign:'center', maxWidth:480, padding:40 }}>
        <div style={{ fontSize:64, marginBottom:20 }}>🎉</div>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:28, color:'#fff', marginBottom:12 }}>Job Posted!</h2>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, lineHeight:1.8, marginBottom:28 }}>Your job listing is live. Candidates can now apply.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={() => navigate('/jobs')} style={{ background:`linear-gradient(135deg,${green},#059669)`, color:'#fff', border:'none', borderRadius:9, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>View Jobs →</button>
          <button onClick={() => navigate('/dashboard')} style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'rgba(255,255,255,0.6)', borderRadius:9, padding:'12px 24px', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Dashboard</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ maxWidth:680, margin:'0 auto', padding:'40px 20px' }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:28, marginBottom:6 }}>Post a Job</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:28 }}>Find qualified candidates for your open position</p>

        {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', color:'#f87171', fontSize:13, marginBottom:16 }}>{error}</div>}

        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:28, display:'grid', gap:16 }}>
          <FI label="Job Title *" value={form.title} onChange={v=>f('title',v)} placeholder="e.g. Senior AI Engineer" />
          <FI label="Company Name *" value={form.company} onChange={v=>f('company',v)} placeholder="e.g. NexWork Technologies" />
          <FI label="Job Description *" value={form.description} onChange={v=>f('description',v)} textarea placeholder="Describe the role, responsibilities, and requirements..." />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={ls}>Job Type</label>
              <select value={form.type} onChange={e=>f('type',e.target.value)} style={inp}>
                <option value="fulltime">Full Time</option><option value="parttime">Part Time</option><option value="contract">Contract</option><option value="internship">Internship</option><option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label style={ls}>Work Mode</label>
              <select value={form.mode} onChange={e=>f('mode',e.target.value)} style={inp}>
                <option value="remote">Remote</option><option value="onsite">Onsite</option><option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {form.mode!=='remote' && <FI label="Location" value={form.location} onChange={v=>f('location',v)} placeholder="e.g. Hyderabad, Telangana" />}

          <div>
            <label style={ls}>Required Skills</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
              {form.skills.map(s => <span key={s} style={{ background:`${green}18`, color:green, fontSize:12, padding:'4px 10px', borderRadius:16 }}>{s} <button onClick={()=>f('skills',form.skills.filter(x=>x!==s))} style={{background:'none',border:'none',color:green,cursor:'pointer'}}>×</button></span>)}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill(skillInput))} placeholder="Add skill and press Enter" style={{...inp,flex:1}} />
              <button onClick={()=>addSkill(skillInput)} style={{ background:green, color:'#fff', border:'none', borderRadius:8, padding:'0 16px', fontWeight:700, cursor:'pointer' }}>Add</button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:8 }}>
              {SKILLS_LIST.filter(s=>!form.skills.includes(s)).slice(0,6).map(s => <button key={s} onClick={()=>addSkill(s)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontSize:11, padding:'3px 10px', borderRadius:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>+ {s}</button>)}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FI label="Min Experience (years)" value={form.experience.min} onChange={v=>f('experience',{...form.experience,min:v})} type="number" placeholder="0" />
            <FI label="Max Experience (years)" value={form.experience.max} onChange={v=>f('experience',{...form.experience,max:v})} type="number" placeholder="5" />
          </div>

          <div>
            <label style={ls}>Salary Range (₹)</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <input type="number" value={form.salary.min} onChange={e=>f('salary',{...form.salary,min:e.target.value})} placeholder="Min" style={inp} />
              <input type="number" value={form.salary.max} onChange={e=>f('salary',{...form.salary,max:e.target.value})} placeholder="Max" style={inp} />
              <select value={form.salary.period} onChange={e=>f('salary',{...form.salary,period:e.target.value})} style={inp}>
                <option value="monthly">Per Month</option><option value="yearly">Per Year</option><option value="hourly">Per Hour</option>
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FI label="Number of Openings" value={form.openings} onChange={v=>f('openings',v)} type="number" placeholder="1" />
            <FI label="Application Deadline" value={form.deadline} onChange={v=>f('deadline',v)} type="date" />
          </div>

          <button onClick={submit} disabled={loading||!form.title||!form.company||!form.description} style={{ background:`linear-gradient(135deg,${green},#059669)`, color:'#fff', border:'none', borderRadius:9, padding:'13px', fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:(loading||!form.title||!form.company||!form.description)?0.5:1, marginTop:8 }}>
            {loading ? '⏳ Posting...' : '🚀 Post Job'}
          </button>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

const FI = ({label,value,onChange,type='text',placeholder,textarea}) => (
  <div><label style={ls}>{label}</label>{textarea?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={4} placeholder={placeholder} style={{...inp,resize:'vertical'}} />:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inp} />}</div>
);
const ls={display:'block',fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:6,textTransform:'uppercase',letterSpacing:1};
const inp={width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'11px 13px',color:'#fff',fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'};
