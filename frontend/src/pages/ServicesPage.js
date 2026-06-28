import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import TopNav from '../components/TopNav';
import Skeleton from '../components/Skeleton';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CATEGORIES = ['All','AI & Machine Learning','Web Development','Graphic Design','Content Writing','Tailoring & Fashion','Photography','Home Services','Teaching','Data Science','Video Editing','SEO'];

export default function ServicesPage() {
  const [params] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState(params.get('category') || '');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadServices(); }, [page, category]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 12 });
      if (category && category !== 'All') q.set('category', category);
      if (search) q.set('search', search);
      const { data } = await axios.get(`${API}/api/services?${q}`);
      setServices(data.services || []);
      setTotal(data.total || 0);
    } catch (e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Browse services</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} services available</p>
          </div>
          <Link to="/create-service" className="btn btn-primary">Offer a service</Link>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, maxWidth: 600 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter' && loadServices()} placeholder="Search services…" className="input" />
          <button onClick={loadServices} className="btn btn-primary">Search</button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c==='All'?'':c); setPage(1); }} className="tag" style={{ cursor:'pointer', background: (category===c||(c==='All'&&!category)) ? 'var(--accent-subtle)' : 'var(--bg)', color: (category===c||(c==='All'&&!category)) ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${(category===c||(c==='All'&&!category)) ? 'transparent' : 'var(--border)'}` }}>{c}</button>
          ))}
        </div>

        {loading ? <Skeleton.List count={6} />
        : services.length === 0 ? (
          <div style={{ textAlign:'center', padding:60 }}>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom: 16 }}>No services in this category yet.</p>
            <Link to="/create-service" className="btn btn-primary">Create the first one →</Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {services.map(s => (
                <div key={s._id} onClick={() => setSelected(s)} className="card card-interactive" style={{ overflow: 'hidden', cursor: 'pointer' }}>

                  {s.images?.[0]
                    ? <img src={s.images[0]} alt={s.title} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', height: 150, background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }} />
                  }

                  <div style={{ padding: '14px 16px' }}>
                    {s.providerId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        {s.providerId.photo
                          ? <img src={s.providerId.photo} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                          : <div className="mono" style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{s.providerId.name?.[0]}</div>
                        }
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.providerId.name}</span>
                        {s.providerId.rating > 0 && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-faint)' }}>★ {s.providerId.rating}</span>}
                      </div>
                    )}

                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>{s.title}</div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                      <span className="tag tag-accent">{s.category}</span>
                      <span className="tag">{s.serviceType}</span>
                    </div>

                    {s.packages?.[0] && (
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>From</div>
                        <div className="mono" style={{ fontWeight: 600, fontSize: 15 }}>₹{s.packages[0].price?.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {total > 12 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
                {page > 1 && <button onClick={() => setPage(p=>p-1)} className="btn btn-secondary">← Prev</button>}
                <span style={{ padding: '9px 16px', color: 'var(--text-muted)', fontSize: 13 }}>Page {page} of {Math.ceil(total/12)}</span>
                {page < Math.ceil(total/12) && <button onClick={() => setPage(p=>p+1)} className="btn btn-secondary">Next →</button>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={() => setSelected(null)} />
          <div className="card" style={{ position:'relative', maxWidth:600, width:'100%', maxHeight:'85vh', overflow:'auto', zIndex:1, background:'var(--bg-raised)' }}>
            <button onClick={() => setSelected(null)} className="btn btn-ghost" style={{ position:'absolute', top:12, right:12 }}>✕</button>
            <div style={{ padding: 26 }}>
              {selected.images?.[0] && <img src={selected.images[0]} alt={selected.title} style={{ width:'100%', height:200, objectFit:'cover', borderRadius:8, marginBottom:16 }} />}
              <h2 style={{ fontSize: 19, fontWeight: 600, marginBottom: 10 }}>{selected.title}</h2>
              <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.7, marginBottom:20 }}>{selected.description}</p>

              {selected.packages?.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Packages</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                    {selected.packages.map((pkg, i) => (
                      <div key={i} className="card" style={{ padding: 14, borderColor: i===1 ? 'var(--accent)' : 'var(--border)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{pkg.name}</div>
                        <div className="mono" style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>₹{pkg.price?.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 8 }}>{pkg.delivery} · {pkg.revisions} revision{pkg.revisions!==1?'s':''}</div>
                        {(pkg.includes||[]).map(inc => <div key={inc} style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>· {inc}</div>)}
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }}>Order {pkg.name}</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link to={`/messages?to=${selected.providerId?._id}`} className="btn btn-secondary" style={{ width: '100%', marginTop: 16, display: 'block', textAlign: 'center' }}>Message provider</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
