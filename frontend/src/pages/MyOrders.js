import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';
import Checkout from '../components/Checkout';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const STATUS_CLASS = { pending:'tag-warning', active:'tag-accent', delivered:'tag-accent', completed:'tag-success', cancelled:'tag-danger', disputed:'tag-danger', refunded:'tag' };

export default function MyOrders() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState({ asClient:[], asProvider:[] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('asClient');
  const [selected, setSelected] = useState(null);
  const [review, setReview] = useState({ rating:5, review:'' });
  const [msg, setMsg] = useState('');
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { const { data } = await axios.get(`${API}/api/orders/my`, { headers:h }); setOrders(data); }
    catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try { await axios.put(`${API}/api/orders/${id}/status`, { status }, { headers:h }); setMsg(`Order ${status}`); load(); setSelected(null); }
    catch(e) { setMsg('Failed to update'); }
  };

  const submitReview = async (id) => {
    try { await axios.post(`${API}/api/orders/${id}/review`, review, { headers:h }); setMsg('Review submitted'); load(); setSelected(null); }
    catch(e) { setMsg('Failed to submit review'); }
  };

  const list = orders[activeTab] || [];

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap:'wrap', gap:12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>My orders</h1>
          <Link to="/services" className="btn btn-primary">Browse services</Link>
        </div>

        {msg && <div className="card" style={{ padding: '10px 14px', marginBottom: 16, fontSize: 13, display:'flex', justifyContent:'space-between' }}>{msg}<button onClick={()=>setMsg('')} className="btn btn-ghost" style={{padding:0}}>✕</button></div>}

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom:'1px solid var(--border)' }}>
          {[['asClient','Purchases'],['asProvider','My services']].map(([id,label]) => (
            <button key={id} onClick={()=>setActiveTab(id)} style={{ padding:'10px 14px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:500, color: activeTab===id?'var(--accent)':'var(--text-muted)', borderBottom: activeTab===id?'2px solid var(--accent)':'2px solid transparent' }}>{label} ({(orders[id]||[]).length})</button>
          ))}
        </div>

        {loading ? <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontSize:13 }}>Loading orders…</div>
        : list.length === 0 ? (
          <div style={{ textAlign:'center', padding:60 }}>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:16 }}>{activeTab==='asClient' ? 'No purchases yet.' : 'No orders yet — create a service to start receiving orders.'}</p>
            <Link to={activeTab==='asClient'?'/services':'/create-service'} className="btn btn-primary">{activeTab==='asClient'?'Browse services →':'Create service →'}</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              {list.map(o => (
                <div key={o._id} onClick={() => setSelected(selected?._id===o._id?null:o)} className="card" style={{ padding: '16px 18px', cursor: 'pointer', borderColor: selected?._id===o._id ? 'var(--accent)' : 'var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`tag ${STATUS_CLASS[o.status]}`} style={{ textTransform:'capitalize' }}>{o.status}</span>
                        <span style={{ color:'var(--text-faint)', fontSize:11 }}>#{o._id?.slice(-8)}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{o.serviceId?.title || 'Service order'}</div>
                      <div style={{ fontSize:13, color:'var(--text-muted)' }}>{activeTab==='asClient' ? `Provider: ${o.providerId?.name||'—'}` : `Client: ${o.clientId?.name||'—'}`}{o.package && ` · ${o.package} package`}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div className="mono" style={{ fontWeight:600, fontSize:17 }}>₹{o.amount?.toLocaleString()}</div>
                      <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:2 }}>fee ₹{o.platformFee?.toLocaleString()}</div>
                      {o.rating > 0 && <div style={{ fontSize:12, marginTop:4 }}>{'★'.repeat(o.rating)}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div className="card" style={{ padding: 20, alignSelf:'start', position:'sticky', top:80 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>Order details</h3>
                  <button onClick={()=>setSelected(null)} className="btn btn-ghost">✕</button>
                </div>
                {[['Status', selected.status],['Service', selected.serviceId?.title||'—'],['Package', selected.package||'—'],['Amount', `₹${selected.amount?.toLocaleString()}`],['Platform fee', `₹${selected.platformFee?.toLocaleString()}`]].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)', fontSize:12 }}>
                    <span style={{ color:'var(--text-faint)' }}>{k}</span><span style={{ fontWeight:500, textTransform:'capitalize' }}>{v}</span>
                  </div>
                ))}

                <div style={{ display:'grid', gap:8, marginTop:16 }}>
                  {activeTab==='asClient' && selected.status==='pending' && selected.paymentStatus!=='paid' && (
                    <Checkout orderId={selected._id} amount={selected.amount} token={token} user={user} onSuccess={() => { setMsg('Payment successful — order active'); load(); setSelected(null); }} onError={(err) => setMsg(err)} />
                  )}
                  {activeTab==='asClient' && selected.status==='pending' && <button onClick={()=>updateStatus(selected._id,'cancelled')} className="btn btn-secondary">Cancel order</button>}
                  {activeTab==='asProvider' && selected.status==='active' && <button onClick={()=>updateStatus(selected._id,'delivered')} className="btn btn-primary">Mark as delivered</button>}
                  {activeTab==='asClient' && selected.status==='delivered' && <button onClick={()=>updateStatus(selected._id,'completed')} className="btn btn-primary">Accept & complete</button>}
                  {activeTab==='asClient' && selected.status==='completed' && !selected.rating && (
                    <div className="card" style={{ padding:14, background:'var(--bg-subtle)' }}>
                      <div style={{ fontSize:12, color:'var(--text-faint)', marginBottom:8 }}>Leave a review</div>
                      <div style={{ display:'flex', gap:4, marginBottom:10 }}>{[1,2,3,4,5].map(s => <button key={s} onClick={()=>setReview(r=>({...r,rating:s}))} style={{ fontSize:18, background:'none', border:'none', cursor:'pointer', opacity:s<=review.rating?1:0.25 }}>★</button>)}</div>
                      <textarea value={review.review} onChange={e=>setReview(r=>({...r,review:e.target.value}))} rows={3} placeholder="Share your experience…" className="input" style={{ resize:'vertical', marginBottom:8 }} />
                      <button onClick={()=>submitReview(selected._id)} className="btn btn-primary" style={{ width:'100%' }}>Submit review</button>
                    </div>
                  )}
                  <Link to={`/messages?to=${activeTab==='asClient'?selected.providerId?._id:selected.clientId?._id}`} className="btn btn-secondary" style={{ textAlign:'center' }}>Message</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
