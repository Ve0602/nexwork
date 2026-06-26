import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CATEGORIES = ['AI & Machine Learning','Web Development','Graphic Design','Content Writing','Tailoring & Fashion','Photography','Home Services','Teaching','Data Science','Video Editing','SEO','Mobile Development'];

export default function CreateService() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title:'', category:'', description:'', serviceType:'remote', location:'',
    tags:[], images:[],
    packages:[
      { name:'Basic',    price:'', delivery:'3', includes:[''], revisions:1 },
      { name:'Standard', price:'', delivery:'5', includes:[''], revisions:2 },
      { name:'Premium',  price:'', delivery:'7', includes:[''], revisions:3 },
    ]
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const updatePackage = (idx, key, val) => { const pkgs=[...form.packages]; pkgs[idx]={...pkgs[idx],[key]:val}; f('packages',pkgs); };
  const updateIncludes = (idx, incIdx, val) => { const pkgs=[...form.packages]; pkgs[idx].includes[incIdx]=val; f('packages',pkgs); };
  const addIncludeLine = (idx) => { const pkgs=[...form.packages]; pkgs[idx].includes.push(''); f('packages',pkgs); };
  const addTag = (t) => { if (t.trim() && !form.tags.includes(t.trim())) f('tags', [...form.tags, t.trim()]); setTagInput(''); };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const packages = form.packages.filter(p => p.price).map(p => ({ ...p, price: parseInt(p.price), delivery: `${p.delivery} days`, includes: p.includes.filter(i=>i.trim()) }));
      if (packages.length === 0) { setError('Add at least one package with a price'); setLoading(false); return; }
      await axios.post(`${API}/api/services`, { ...form, packages }, { headers:{ Authorization:`Bearer ${token}` } });
      setDone(true);
    } catch(e) { setError(e.response?.data?.message||'Failed to create service'); }
    finally { setLoading(false); }
  };

  const STEPS = ['Basic info','Packages','Review'];

  if (done) return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'70vh', textAlign:'center', padding:40 }}>
        <div style={{ maxWidth:420 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>Service created</h2>
          <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.7, marginBottom:24 }}>Your gig is live on the marketplace.</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <button onClick={() => navigate('/services')} className="btn btn-primary">View marketplace</button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth:680, margin:'0 auto', padding:'32px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Create a service</h1>
        <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:24 }}>Offer your skills as a gig</p>

        <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
          {STEPS.map((s,i) => (
            <div key={s} style={{ display:'flex', alignItems:'center', flex: i<STEPS.length-1?1:'none' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div className="mono" style={{ width:28, height:28, borderRadius:'50%', background: step>=i+1?'var(--accent)':'var(--bg-subtle)', border:`1px solid ${step>=i+1?'var(--accent)':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:step>=i+1?'#fff':'var(--text-faint)' }}>{step>i+1?'✓':i+1}</div>
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
              <FI label="Service title" value={form.title} onChange={v=>f('title',v)} placeholder="e.g. I will build a custom AI chatbot for your business" />
              <div>
                <label style={ls}>Category</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {CATEGORIES.map(c => <button key={c} onClick={()=>f('category',c)} className="tag" style={{ cursor:'pointer', background: form.category===c?'var(--accent-subtle)':'var(--bg)', color: form.category===c?'var(--accent)':'var(--text-muted)', border:`1px solid ${form.category===c?'transparent':'var(--border)'}` }}>{c}</button>)}
                </div>
              </div>
              <FI label="Description" value={form.description} onChange={v=>f('description',v)} textarea placeholder="Describe your service in detail" />
              <div>
                <label style={ls}>Service type</label>
                <div style={{ display:'flex', gap:10 }}>
                  {[['remote','Remote'],['local','Local (in-person)'],['both','Both']].map(([v,l]) => (
                    <button key={v} onClick={()=>f('serviceType',v)} className="btn" style={{ flex:1, border:`1px solid ${form.serviceType===v?'var(--accent)':'var(--border)'}`, background:form.serviceType===v?'var(--accent-subtle)':'transparent', color:form.serviceType===v?'var(--accent)':'var(--text-muted)' }}>{l}</button>
                  ))}
                </div>
              </div>
              {(form.serviceType==='local'||form.serviceType==='both') && <FI label="Service location" value={form.location} onChange={v=>f('location',v)} placeholder="e.g. Warangal, Telangana" />}
              <div>
                <label style={ls}>Tags</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                  {form.tags.map(t => <span key={t} className="tag tag-accent" style={{ display:'flex', alignItems:'center', gap:5 }}>{t}<button onClick={()=>f('tags',form.tags.filter(x=>x!==t))} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>×</button></span>)}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addTag(tagInput))} placeholder="Add a tag and press Enter" className="input" />
                  <button onClick={()=>addTag(tagInput)} className="btn btn-secondary">Add</button>
                </div>
              </div>
            </div>
          )}

          {step===2 && (
            <div>
              <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:18 }}>Set up to 3 pricing tiers. Basic is required.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                {form.packages.map((pkg,i) => (
                  <div key={pkg.name} className="card" style={{ padding:14, borderColor: i===1?'var(--accent)':'var(--border)' }}>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:12, textAlign:'center', color: i===1?'var(--accent)':'var(--text)' }}>{pkg.name}</div>
                    <label style={ls}>Price (₹)</label>
                    <input type="number" value={pkg.price} onChange={e=>updatePackage(i,'price',e.target.value)} placeholder="2000" className="input" style={{ marginBottom:10 }} />
                    <label style={ls}>Delivery (days)</label>
                    <input type="number" value={pkg.delivery} onChange={e=>updatePackage(i,'delivery',e.target.value)} className="input" style={{ marginBottom:10 }} />
                    <label style={ls}>Revisions</label>
                    <input type="number" value={pkg.revisions} onChange={e=>updatePackage(i,'revisions',parseInt(e.target.value)||1)} className="input" style={{ marginBottom:10 }} />
                    <label style={ls}>Includes</label>
                    {pkg.includes.map((inc,incIdx) => <input key={incIdx} value={inc} onChange={e=>updateIncludes(i,incIdx,e.target.value)} placeholder={`Feature ${incIdx+1}`} className="input" style={{ marginBottom:6, fontSize:12 }} />)}
                    <button onClick={()=>addIncludeLine(i)} className="btn btn-ghost" style={{ fontSize:11, padding:0 }}>+ Add feature</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step===3 && (
            <div>
              <div className="card" style={{ padding: 16, background:'var(--bg-subtle)', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{form.title}</div>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}><span className="tag tag-accent">{form.category}</span><span className="tag">{form.serviceType}</span></div>
                <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.6 }}>{form.description}</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {form.packages.filter(p=>p.price).map(pkg => (
                  <div key={pkg.name} className="card" style={{ padding:14, textAlign:'center' }}>
                    <div style={{ fontWeight:600, fontSize:13, marginBottom:6 }}>{pkg.name}</div>
                    <div className="mono" style={{ fontWeight:600, fontSize:17 }}>₹{parseInt(pkg.price).toLocaleString()}</div>
                    <div style={{ fontSize:11, color:'var(--text-faint)' }}>{pkg.delivery} days</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:20 }}>
            {step>1 ? <button onClick={()=>setStep(s=>s-1)} className="btn btn-secondary">← Back</button> : <div />}
            {step<3
              ? <button onClick={()=>setStep(s=>s+1)} disabled={step===1&&(!form.title||!form.category||!form.description)} className="btn btn-primary" style={{ opacity:(step===1&&(!form.title||!form.category||!form.description))?0.4:1 }}>Continue →</button>
              : <button onClick={submit} disabled={loading} className="btn btn-primary">{loading?'Creating…':'Publish service'}</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

const FI = ({label,value,onChange,placeholder,textarea}) => (
  <div><label style={ls}>{label}</label>{textarea?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={4} placeholder={placeholder} className="input" style={{ resize:'vertical' }} />:<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="input" />}</div>
);
const ls = { display:'block', fontSize:11, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' };
