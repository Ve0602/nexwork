import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CATEGORIES = ['All','AI & Machine Learning','Web Development','Graphic Design','Content Writing','Tailoring & Fashion','Photography','Home Services','Teaching','Data Science','Video Editing','SEO'];
const SERVICE_TYPES = [{ value:'', label:'All Types' },{ value:'remote', label:'Remote' },{ value:'local', label:'Local' },{ value:'both', label:'Both' }];

export default function ServicesPage() {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [category, setCategory]   = useState(params.get('category') || '');
  const [serviceType, setServiceType] = useState('');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState(null);

  useEffect(() => { loadServices(); }, [page, category, serviceType]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 12 });
      if (category && category !== 'All') q.set('category', category);
      if (serviceType) q.set('serviceType', serviceType);
      if (search) q.set('search', search);
      const { data } = await axios.get(`${API}/api/services?${q}`);
      setServices(data.services || []);
      setTotal(data.total || 0);
    } catch (e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const gold = '#d4a853';

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0d0820,#07070f)', padding:'40px 60px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:'clamp(24px,4vw,40px)', marginBottom:8 }}>
          Browse <span style={{ color:'#e91e8c' }}>Services</span>
        </h1>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, marginBottom:24 }}>{total} services available</p>

        <div style={{ display:'flex', gap:10, maxWidth:700, marginBottom:20 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter' && loadServices()} placeholder="Search services..." style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'13px 16px', color:'#fff', fontSize:14, outline:'none', fontFamily:'DM Sans,sans-serif' }} />
          <select value={serviceType} onChange={e => { setServiceType(e.target.value); setPage(1); }} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'0 16px', color:'#fff', fontSize:14, outline:'none', fontFamily:'DM Sans,sans-serif' }}>
            {SERVICE_TYPES.map(t => <option key={t.value} value={t.value} style={{ background:'#1a1a2e' }}>{t.label}</option>)}
          </select>
          <button onClick={loadServices} style={{ background:'linear-gradient(135deg,#e91e8c,#c2185b)', color:'#fff', border:'none', borderRadius:10, padding:'13px 24px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Search</button>
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c==='All'?'':c); setPage(1); }} style={{ padding:'7px 16px', borderRadius:20, border:`1px solid ${(category===c||(c==='All'&&!category))?'#e91e8c':'rgba(255,255,255,0.1)'}`, background:(category===c||(c==='All'&&!category))?'rgba(233,30,140,0.15)':'transparent', color:(category===c||(c==='All'&&!category))?'#e91e8c':'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.2s' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'28px 60px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>Showing {services.length} of {total} services</p>
          <Link to="/create-service" style={{ background:'linear-gradient(135deg,#e91e8c,#c2185b)', color:'#fff', textDecoration:'none', padding:'10px 20px', borderRadius:9, fontWeight:700, fontSize:13, fontFamily:'DM Sans,sans-serif' }}>+ Offer a Service</Link>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:'#e91e8c' }}>Loading services...</div>
        ) : services.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:48, marginBottom:14 }}>🛍️</div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:20, marginBottom:8 }}>No services found</h3>
            <p style={{ color:'rgba(255,255,255,0.4)', marginBottom:20 }}>Be the first to offer a service in this category!</p>
            <Link to="/create-service" style={{ background:'linear-gradient(135deg,#e91e8c,#c2185b)', color:'#fff', textDecoration:'none', padding:'12px 24px', borderRadius:9, fontWeight:700, fontSize:14 }}>+ Create Service</Link>
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
              {services.map(s => (
                <div key={s._id} onClick={() => setSelected(s)} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, overflow:'hidden', cursor:'pointer', transition:'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(233,30,140,0.4)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(233,30,140,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>

                  {/* Image */}
                  {s.images?.[0]
                    ? <img src={s.images[0]} alt={s.title} style={{ width:'100%', height:180, objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:180, background:'linear-gradient(135deg,rgba(233,30,140,0.15),rgba(124,58,237,0.1))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:52 }}>
                        {s.category==='Tailoring & Fashion'?'🧵':s.category==='Photography'?'📷':s.category==='Web Development'?'💻':s.category==='AI & Machine Learning'?'🤖':'🎨'}
                      </div>
                  }

                  <div style={{ padding:'14px 16px' }}>
                    {/* Provider */}
                    {s.providerId && (
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                        {s.providerId.photo
                          ? <img src={s.providerId.photo} alt="" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover' }} />
                          : <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(233,30,140,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#e91e8c' }}>{s.providerId.name?.[0]}</div>
                        }
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.8)' }}>{s.providerId.name}</div>
                          {s.providerId.city && <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>📍 {s.providerId.city}</div>}
                        </div>
                        {s.providerId.rating > 0 && <div style={{ marginLeft:'auto', fontSize:12, color:gold }}>★ {s.providerId.rating}</div>}
                      </div>
                    )}

                    <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'#fff', marginBottom:6, lineHeight:1.4 }}>{s.title}</h3>

                    {/* Tags */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                      <span style={{ background:'rgba(233,30,140,0.12)', border:'1px solid rgba(233,30,140,0.2)', color:'#e91e8c', fontSize:10, padding:'2px 7px', borderRadius:10 }}>{s.category}</span>
                      <span style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', fontSize:10, padding:'2px 7px', borderRadius:10 }}>{s.serviceType}</span>
                      {s.isFeatured && <span style={{ background:`${gold}18`, color:gold, fontSize:10, padding:'2px 7px', borderRadius:10 }}>⭐ Featured</span>}
                    </div>

                    {/* Packages */}
                    {s.packages?.[0] && (
                      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Starting at</div>
                          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:gold }}>₹{s.packages[0].price?.toLocaleString()}</div>
                        </div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>Delivery: {s.packages[0].delivery}</div>
                      </div>
                    )}

                    <div style={{ display:'flex', gap:8, marginTop:12 }}>
                      <button style={{ flex:1, background:'linear-gradient(135deg,#e91e8c,#c2185b)', color:'#fff', border:'none', borderRadius:8, padding:'9px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Order Now</button>
                      <Link to={`/messages?to=${s.providerId?._id}`} onClick={e=>e.stopPropagation()} style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'rgba(255,255,255,0.6)', borderRadius:8, padding:'9px 14px', fontSize:12, fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center' }}>💬</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {total > 12 && (
              <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:32 }}>
                {page > 1 && <button onClick={() => setPage(p=>p-1)} style={pgBtn}>← Prev</button>}
                <span style={{ padding:'9px 16px', color:'rgba(255,255,255,0.5)', fontSize:13 }}>Page {page} of {Math.ceil(total/12)}</span>
                {page < Math.ceil(total/12) && <button onClick={() => setPage(p=>p+1)} style={pgBtn}>Next →</button>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Service Detail Modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.88)', backdropFilter:'blur(10px)' }} onClick={() => setSelected(null)} />
          <div style={{ position:'relative', background:'#111', border:'1px solid rgba(233,30,140,0.3)', borderRadius:16, maxWidth:680, width:'100%', maxHeight:'90vh', overflow:'auto', zIndex:1 }}>
            <button onClick={() => setSelected(null)} style={{ position:'sticky', top:10, right:10, float:'right', background:'rgba(255,255,255,0.08)', border:'none', color:'#fff', width:34, height:34, borderRadius:'50%', cursor:'pointer', fontSize:16, margin:12 }}>✕</button>
            <div style={{ padding:28 }}>
              {selected.images?.[0] && <img src={selected.images[0]} alt={selected.title} style={{ width:'100%', height:240, objectFit:'cover', borderRadius:10, marginBottom:16 }} />}
              <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:'#fff', marginBottom:8 }}>{selected.title}</h2>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, lineHeight:1.7, marginBottom:16 }}>{selected.description}</p>

              {/* Packages */}
              {selected.packages?.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:12 }}>Packages</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
                    {selected.packages.map((pkg, i) => (
                      <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${i===1?'rgba(233,30,140,0.4)':'rgba(255,255,255,0.1)'}`, borderRadius:10, padding:14, position:'relative' }}>
                        {i===1 && <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:'#e91e8c', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 10px', borderRadius:10 }}>POPULAR</div>}
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'#fff', marginBottom:4 }}>{pkg.name}</div>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:gold, marginBottom:8 }}>₹{pkg.price?.toLocaleString()}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>⏱ {pkg.delivery} · {pkg.revisions} revision{pkg.revisions!==1?'s':''}</div>
                        {(pkg.includes||[]).map(inc => <div key={inc} style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginBottom:3 }}>✓ {inc}</div>)}
                        <button style={{ width:'100%', marginTop:10, background:`linear-gradient(135deg,#e91e8c,#c2185b)`, color:'#fff', border:'none', borderRadius:8, padding:'9px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Order {pkg.name}</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:10 }}>
                <Link to={`/messages?to=${selected.providerId?._id}`} style={{ flex:1, background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.7)', textDecoration:'none', padding:'12px', borderRadius:9, fontWeight:600, fontSize:13, textAlign:'center' }}>💬 Message Provider</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

const gold = '#d4a853';
const pgBtn = { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', borderRadius:8, padding:'9px 18px', cursor:'pointer', fontSize:13, fontFamily:'DM Sans,sans-serif' };
