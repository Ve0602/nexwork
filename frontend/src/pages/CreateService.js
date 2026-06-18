import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CATEGORIES = ['AI & Machine Learning','Web Development','Graphic Design','Content Writing','Tailoring & Fashion','Photography','Home Services','Teaching','Data Science','Video Editing','SEO','Mobile Development'];

export default function CreateService() {
  const { token, user } = useAuth();
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
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const updatePackage = (idx, key, val) => {
    const pkgs = [...form.packages];
    pkgs[idx] = { ...pkgs[idx], [key]:val };
    f('packages', pkgs);
  };

  const updateIncludes = (idx, incIdx, val) => {
    const pkgs = [...form.packages];
    pkgs[idx].includes[incIdx] = val;
    f('packages', pkgs);
  };

  const addIncludeLine = (idx) => {
    const pkgs = [...form.packages];
    pkgs[idx].includes.push('');
    f('packages', pkgs);
  };

  const addTag = (t) => {
    if (t.trim() && !form.tags.includes(t.trim())) f('tags', [...form.tags, t.trim()]);
    setTagInput('');
  };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const packages = form.packages
        .filter(p => p.price)
        .map(p => ({ ...p, price: parseInt(p.price), delivery: `${p.delivery} days`, includes: p.includes.filter(i=>i.trim()) }));
      if (packages.length === 0) { setError('Add at least one package with a price'); setLoading(false); return; }
      await axios.post(`${API}/api/services`, { ...form, packages }, { headers:{ Authorization:`Bearer ${token}` } });
      setDone(true);
    } catch(e) { setError(e.response?.data?.message||'Failed to create service'); }
    finally { setLoading(false); }
  };

  const gold = '#e91e8c';
  const STEPS = ['Basic Info','Packages & Pricing','Review'];

  if (done) return (
    <div style={{ background:'#07070f', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', paddingTop:64 }}>
      <div style={{ textAlign:'center', maxWidth:480, padding:40 }}>
        <div style={{ fontSize:64, marginBottom:20 }}>🎉</div>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:28, color:'#fff', marginBottom:12 }}>Service Created!</h2>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, lineHeight:1.8, marginBottom:28 }}>Your gig is now live on the marketplace. Clients can start ordering!</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={() => navigate('/services')} style={{ background:`linear-gradient(135deg,${gold},#c2185b)`, color:'#fff', border:'none', borderRadius:9, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>View Marketplace →</button>
          <button onClick={() => navigate('/dashboard')} style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'rgba(255,255,255,0.6)', borderRadius:9, padding:'12px 24px', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Dashboard</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ maxWidth:760, margin:'0 auto', padding:'40px 20px' }}>

        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:28, marginBottom:6 }}>Create a Service</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:28 }}>Offer your skills as a gig and start earning</p>

        {/* Steps */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
          {STEPS.map((s,i) => (
            <div key={s} style={{ display:'flex', alignItems:'center', flex: i<STEPS.length-1?1:'none' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:step>i+1?gold:step===i+1?`linear-gradient(135deg,${gold},#c2185b)`:'rgba(255,255,255,0.08)', border:`2px solid ${step>=i+1?gold:'rgba(255,255,255,0.12)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:step>=i+1?'#fff':'rgba(255,255,255,0.3)', fontFamily:'Syne,sans-serif' }}>{step>i+1?'✓':i+1}</div>
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
            <div style={{ display:'grid', gap:16 }}>
              <FI label="Service Title *" value={form.title} onChange={v=>f('title',v)} placeholder="e.g. I will build a custom AI chatbot for your business" />
              <div>
                <label style={ls}>Category *</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {CATEGORIES.map(c => <button key={c} onClick={()=>f('category',c)} style={{ padding:'8px 14px', borderRadius:20, border:`1px solid ${form.category===c?gold:'rgba(255,255,255,0.1)'}`, background:form.category===c?`${gold}18`:'transparent', color:form.category===c?gold:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>{c}</button>)}
                </div>
              </div>
              <FI label="Description *" value={form.description} onChange={v=>f('description',v)} textarea placeholder="Describe your service in detail. What will the client get?" />
              <div>
                <label style={ls}>Service Type</label>
                <div style={{ display:'flex', gap:10 }}>
                  {[['remote','🌍 Remote'],['local','📍 Local (In-person)'],['both','🔄 Both']].map(([v,l]) => (
                    <button key={v} onClick={()=>f('serviceType',v)} style={{ flex:1, padding:'11px', border:`2px solid ${form.serviceType===v?gold:'rgba(255,255,255,0.1)'}`, background:form.serviceType===v?`${gold}18`:'transparent', color:form.serviceType===v?gold:'rgba(255,255,255,0.5)', borderRadius:9, cursor:'pointer', fontWeight:500, fontSize:13, fontFamily:'DM Sans,sans-serif' }}>{l}</button>
                  ))}
                </div>
              </div>
              {(form.serviceType==='local'||form.serviceType==='both') && <FI label="Service Location" value={form.location} onChange={v=>f('location',v)} placeholder="e.g. Warangal, Telangana" />}
              <div>
                <label style={ls}>Tags (helps clients find you)</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                  {form.tags.map(t => <span key={t} style={{ background:`${gold}18`, color:gold, fontSize:12, padding:'4px 10px', borderRadius:16 }}>{t} <button onClick={()=>f('tags',form.tags.filter(x=>x!==t))} style={{ background:'none', border:'none', color:gold, cursor:'pointer' }}>×</button></span>)}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addTag(tagInput))} placeholder="Add a tag and press Enter" style={{...inp,flex:1}} />
                  <button onClick={()=>addTag(tagInput)} style={{ background:gold, color:'#fff', border:'none', borderRadius:8, padding:'0 16px', fontWeight:700, cursor:'pointer' }}>Add</button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 - Packages */}
          {step===2 && (
            <div>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginBottom:18 }}>Set up to 3 pricing tiers. At least the Basic package is required.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                {form.packages.map((pkg,i) => (
                  <div key={pkg.name} style={{ background: i===1?`${gold}08`:'rgba(255,255,255,0.03)', border:`1px solid ${i===1?`${gold}30`:'rgba(255,255,255,0.08)'}`, borderRadius:12, padding:16 }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color: i===1?gold:'#fff', marginBottom:12, textAlign:'center' }}>{pkg.name}{i===1&&' ⭐'}</div>
                    <label style={ls}>Price (₹)</label>
                    <input type="number" value={pkg.price} onChange={e=>updatePackage(i,'price',e.target.value)} placeholder="e.g. 2000" style={{...inp,marginBottom:10}} />
                    <label style={ls}>Delivery (days)</label>
                    <input type="number" value={pkg.delivery} onChange={e=>updatePackage(i,'delivery',e.target.value)} style={{...inp,marginBottom:10}} />
                    <label style={ls}>Revisions</label>
                    <input type="number" value={pkg.revisions} onChange={e=>updatePackage(i,'revisions',parseInt(e.target.value)||1)} style={{...inp,marginBottom:10}} />
                    <label style={ls}>What's Included</label>
                    {pkg.includes.map((inc,incIdx) => (
                      <input key={incIdx} value={inc} onChange={e=>updateIncludes(i,incIdx,e.target.value)} placeholder={`Feature ${incIdx+1}`} style={{...inp,marginBottom:6,fontSize:12}} />
                    ))}
                    <button onClick={()=>addIncludeLine(i)} style={{ background:'none', border:'none', color:gold, fontSize:11, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>+ Add feature</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 - Review */}
          {step===3 && (
            <div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:18, marginBottom:18 }}>Review your service</h3>
              <div style={{ background:'rgba(233,30,140,0.06)', border:`1px solid ${gold}25`, borderRadius:10, padding:18, marginBottom:16 }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:6 }}>{form.title}</div>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}><span style={{ background:`${gold}15`, color:gold, fontSize:11, padding:'2px 10px', borderRadius:10 }}>{form.category}</span><span style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', fontSize:11, padding:'2px 10px', borderRadius:10 }}>{form.serviceType}</span></div>
                <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, lineHeight:1.6 }}>{form.description}</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {form.packages.filter(p=>p.price).map(pkg => (
                  <div key={pkg.name} style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:14, textAlign:'center' }}>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>{pkg.name}</div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:gold }}>₹{parseInt(pkg.price).toLocaleString()}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{pkg.delivery} days</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:24 }}>
            {step>1 ? <button onClick={()=>setStep(s=>s-1)} style={btnOut}>← Back</button> : <div />}
            {step<3
              ? <button onClick={()=>setStep(s=>s+1)} disabled={step===1&&(!form.title||!form.category||!form.description)} style={{...btnGold,opacity:(step===1&&(!form.title||!form.category||!form.description))?0.4:1}}>Continue →</button>
              : <button onClick={submit} disabled={loading} style={{...btnGold,opacity:loading?0.7:1}}>{loading?'Creating...':'🚀 Publish Service'}</button>
            }
          </div>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

const FI = ({label,value,onChange,placeholder,textarea}) => (
  <div><label style={ls}>{label}</label>{textarea?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={4} placeholder={placeholder} style={{...inp,resize:'vertical'}} />:<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inp} />}</div>
);
const gold='#e91e8c';
const ls={display:'block',fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:6,textTransform:'uppercase',letterSpacing:1};
const inp={width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'10px 12px',color:'#fff',fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'};
const btnGold={background:`linear-gradient(135deg,${gold},#c2185b)`,color:'#fff',border:'none',borderRadius:9,padding:'12px 26px',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'DM Sans,sans-serif'};
const btnOut={background:'transparent',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,padding:'12px 24px',fontWeight:500,fontSize:14,cursor:'pointer',fontFamily:'DM Sans,sans-serif'};
