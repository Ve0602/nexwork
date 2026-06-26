import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

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
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
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

  if (done) return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'70vh', textAlign:'center', padding:40 }}>
        <div style={{ maxWidth:420 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>Job posted</h2>
          <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.7, marginBottom:24 }}>Your listing is live. Candidates can now apply.</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <button onClick={() => navigate('/jobs')} className="btn btn-primary">View jobs</button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth:600, margin:'0 auto', padding:'32px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Post a job</h1>
        <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:24 }}>Find qualified candidates for your open role</p>

        {error && <div className="card" style={{ padding:'10px 14px', marginBottom:16, fontSize:13, color:'var(--danger)' }}>{error}</div>}

        <div className="card" style={{ padding: 24, display:'grid', gap:16 }}>
          <FI label="Job title" value={form.title} onChange={v=>f('title',v)} placeholder="e.g. Senior AI Engineer" />
          <FI label="Company name" value={form.company} onChange={v=>f('company',v)} placeholder="e.g. NexWork Technologies" />
          <FI label="Job description" value={form.description} onChange={v=>f('description',v)} textarea placeholder="Describe the role, responsibilities, requirements…" />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={ls}>Job type</label>
              <select value={form.type} onChange={e=>f('type',e.target.value)} className="input">
                <option value="fulltime">Full time</option><option value="parttime">Part time</option><option value="contract">Contract</option><option value="internship">Internship</option><option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label style={ls}>Work mode</label>
              <select value={form.mode} onChange={e=>f('mode',e.target.value)} className="input">
                <option value="remote">Remote</option><option value="onsite">Onsite</option><option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {form.mode!=='remote' && <FI label="Location" value={form.location} onChange={v=>f('location',v)} placeholder="e.g. Hyderabad, Telangana" />}

          <div>
            <label style={ls}>Required skills</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
              {form.skills.map(s => <span key={s} className="tag tag-accent" style={{ display:'flex', alignItems:'center', gap:5 }}>{s}<button onClick={()=>f('skills',form.skills.filter(x=>x!==s))} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>×</button></span>)}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill(skillInput))} placeholder="Add skill and press Enter" className="input" />
              <button onClick={()=>addSkill(skillInput)} className="btn btn-secondary">Add</button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:8 }}>
              {SKILLS_LIST.filter(s=>!form.skills.includes(s)).slice(0,6).map(s => <button key={s} onClick={()=>addSkill(s)} className="tag" style={{ cursor:'pointer' }}>+ {s}</button>)}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FI label="Min experience (years)" value={form.experience.min} onChange={v=>f('experience',{...form.experience,min:v})} type="number" placeholder="0" />
            <FI label="Max experience (years)" value={form.experience.max} onChange={v=>f('experience',{...form.experience,max:v})} type="number" placeholder="5" />
          </div>

          <div>
            <label style={ls}>Salary range (₹)</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <input type="number" value={form.salary.min} onChange={e=>f('salary',{...form.salary,min:e.target.value})} placeholder="Min" className="input" />
              <input type="number" value={form.salary.max} onChange={e=>f('salary',{...form.salary,max:e.target.value})} placeholder="Max" className="input" />
              <select value={form.salary.period} onChange={e=>f('salary',{...form.salary,period:e.target.value})} className="input">
                <option value="monthly">Per month</option><option value="yearly">Per year</option><option value="hourly">Per hour</option>
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FI label="Number of openings" value={form.openings} onChange={v=>f('openings',v)} type="number" placeholder="1" />
            <FI label="Application deadline" value={form.deadline} onChange={v=>f('deadline',v)} type="date" />
          </div>

          <button onClick={submit} disabled={loading||!form.title||!form.company||!form.description} className="btn btn-primary" style={{ opacity:(loading||!form.title||!form.company||!form.description)?0.5:1, marginTop:6 }}>
            {loading ? 'Posting…' : 'Post job'}
          </button>
        </div>
      </div>
    </div>
  );
}

const FI = ({label,value,onChange,type='text',placeholder,textarea}) => (
  <div><label style={ls}>{label}</label>{textarea?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={4} placeholder={placeholder} className="input" style={{ resize:'vertical' }} />:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="input" />}</div>
);
const ls = { display:'block', fontSize:11, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' };
