import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Checkout from '../components/Checkout';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STATUS_COLORS = {
  pending:'#f59e0b', active:'#00d4ff', delivered:'#7c3aed',
  completed:'#4ade80', cancelled:'#f87171', disputed:'#ef4444', refunded:'#a78bfa'
};

export default function MyOrders() {
  const { token, user } = useAuth();
  const [orders, setOrders]     = useState({ asClient:[], asProvider:[] });
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('asClient');
  const [selected, setSelected] = useState(null);
  const [review, setReview]     = useState({ rating:5, review:'' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]           = useState('');
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/api/orders/my`, { headers:h });
      setOrders(data);
    } catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/orders/${id}/status`, { status }, { headers:h });
      setMsg(`✅ Order marked as ${status}`);
      load();
      setSelected(null);
    } catch(e) { setMsg('❌ Failed to update status'); }
  };

  const submitReview = async (orderId) => {
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/orders/${orderId}/review`, review, { headers:h });
      setMsg('✅ Review submitted!');
      load();
      setSelected(null);
    } catch(e) { setMsg('❌ '+(e.response?.data?.message||'Review failed')); }
    finally { setSubmitting(false); }
  };

  const gold = '#d4a853';
  const currentOrders = orders[activeTab] || [];

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ padding:'32px 60px' }}>

        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:28, marginBottom:6 }}>📦 My Orders</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:24 }}>Track and manage all your orders</p>

        {msg && <div style={{ background:msg.startsWith('✅')?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:8, padding:'10px 14px', color:msg.startsWith('✅')?'#4ade80':'#f87171', fontSize:13, marginBottom:16, display:'flex', justifyContent:'space-between' }}>{msg}<button onClick={()=>setMsg('')} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div>}

        {/* Tabs */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:4, marginBottom:24, width:'fit-content', gap:4 }}>
          {[['asClient','🛒 My Purchases'],['asProvider','💼 My Sales']].map(([id,label]) => (
            <button key={id} onClick={()=>setActiveTab(id)} style={{ padding:'10px 20px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, background:activeTab===id?'rgba(255,255,255,0.08)':'transparent', color:activeTab===id?'#fff':'rgba(255,255,255,0.4)', transition:'all 0.2s' }}>{label} ({orders[id]?.length||0})</button>
          ))}
        </div>

        {loading ? <div style={{ textAlign:'center', padding:60, color:gold }}>Loading orders...</div>
        : currentOrders.length===0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:52, marginBottom:14 }}>📦</div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:20, marginBottom:8 }}>No orders yet</h3>
            <p style={{ color:'rgba(255,255,255,0.4)', marginBottom:20 }}>{activeTab==='asClient'?'Browse services and place your first order!':'Create a service to start receiving orders!'}</p>
            <Link to={activeTab==='asClient'?'/services':'/create-service'} style={{ background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', textDecoration:'none', padding:'11px 24px', borderRadius:9, fontWeight:700, fontSize:14 }}>{activeTab==='asClient'?'Browse Services →':'Create Service →'}</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns: selected?'1fr 380px':'1fr', gap:20 }}>
            {/* Order list */}
            <div style={{ display:'grid', gap:12 }}>
              {currentOrders.map(o => (
                <div key={o._id} onClick={()=>setSelected(selected?._id===o._id?null:o)} style={{ background: selected?._id===o._id?'rgba(212,168,83,0.06)':'rgba(255,255,255,0.03)', border:`1px solid ${selected?._id===o._id?`${gold}40`:'rgba(255,255,255,0.07)'}`, borderRadius:13, padding:'18px 20px', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>{if(selected?._id!==o._id){e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}}
                  onMouseLeave={e=>{if(selected?._id!==o._id){e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';}}}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', gap:14, flexWrap:'wrap' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                        <span style={{ background:`${STATUS_COLORS[o.status]}15`, color:STATUS_COLORS[o.status], fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:10, textTransform:'uppercase' }}>{o.status}</span>
                        <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>📅 {new Date(o.createdAt).toLocaleDateString()}</span>
                        <span style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', fontSize:10, padding:'2px 8px', borderRadius:8 }}>{o.package} package</span>
                      </div>
                      <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#fff', marginBottom:6 }}>{o.serviceId?.title||'Service Order'}</h3>
                      <div style={{ display:'flex', gap:16, fontSize:12, color:'rgba(255,255,255,0.4)' }}>
                        {activeTab==='asClient' ? <span>🧑‍💻 Provider: <strong style={{color:'rgba(255,255,255,0.7)'}}>{o.providerId?.name}</strong></span> : <span>👤 Client: <strong style={{color:'rgba(255,255,255,0.7)'}}>{o.clientId?.name}</strong></span>}
                        {o.deliveryDate && <span>⏱ Due: {new Date(o.deliveryDate).toLocaleDateString()}</span>}
                      </div>
                      {o.requirements && <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, lineHeight:1.5, marginTop:6 }}>{o.requirements.substring(0,100)}{o.requirements.length>100?'...':''}</p>}
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:gold }}>₹{o.amount?.toLocaleString()}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>Platform fee: ₹{o.platformFee?.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order detail panel */}
            {selected && (
              <div style={{ background:'#111', border:`1px solid ${gold}25`, borderRadius:14, padding:22, alignSelf:'start', maxHeight:'80vh', overflowY:'auto' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                  <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#fff' }}>Order Details</h3>
                  <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:18 }}>✕</button>
                </div>

                {/* Info rows */}
                {[
                  ['Status', <span style={{ color:STATUS_COLORS[selected.status], fontWeight:700, textTransform:'capitalize' }}>{selected.status}</span>],
                  ['Amount', `₹${selected.amount?.toLocaleString()}`],
                  ['Platform Fee', `₹${selected.platformFee?.toLocaleString()}`],
                  ['Net Amount', `₹${selected.netAmount?.toLocaleString()}`],
                  ['Package', selected.package],
                  ['Ordered', new Date(selected.createdAt).toLocaleDateString()],
                  ['Due Date', selected.deliveryDate ? new Date(selected.deliveryDate).toLocaleDateString() : 'N/A'],
                  ['Payment', selected.paymentStatus],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:13 }}>
                    <span style={{ color:'rgba(255,255,255,0.4)' }}>{k}</span>
                    <span style={{ color:'#fff', fontWeight:500 }}>{v}</span>
                  </div>
                ))}

                {selected.requirements && <div style={{ margin:'12px 0' }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>Requirements</div>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, lineHeight:1.6, background:'rgba(255,255,255,0.04)', padding:'10px 12px', borderRadius:8 }}>{selected.requirements}</p>
                </div>}

                {/* Actions */}
                <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Actions</div>
                  <div style={{ display:'grid', gap:8 }}>
                    {/* Provider can mark delivered */}
                    {activeTab==='asProvider' && selected.status==='active' && (
                      <button onClick={()=>updateStatus(selected._id,'delivered')} style={btnGreen}>📦 Mark as Delivered</button>
                    )}
                    {/* Client can complete or dispute */}
                    {activeTab==='asClient' && selected.status==='delivered' && (
                      <>
                        <button onClick={()=>updateStatus(selected._id,'completed')} style={btnGold}>✅ Accept & Complete</button>
                        <button onClick={()=>updateStatus(selected._id,'disputed')} style={btnRed}>⚠️ Raise Dispute</button>
                      </>
                    )}
                    {/* Client pays for pending unpaid order */}
                    {activeTab==='asClient' && selected.status==='pending' && selected.paymentStatus!=='paid' && (
                      <Checkout
                        orderId={selected._id}
                        amount={selected.amount}
                        token={token}
                        user={user}
                        onSuccess={() => { setMsg('✅ Payment successful! Order is now active.'); load(); setSelected(null); }}
                        onError={(err) => setMsg('❌ ' + err)}
                      />
                    )}
                    {/* Client can cancel pending */}
                    {activeTab==='asClient' && selected.status==='pending' && (
                      <button onClick={()=>updateStatus(selected._id,'cancelled')} style={btnRed}>❌ Cancel Order</button>
                    )}
                    {/* Message */}
                    <Link to={`/messages?to=${activeTab==='asClient'?selected.providerId?._id:selected.clientId?._id}`} style={{ ...btnOutline, textDecoration:'none', textAlign:'center', display:'block' }}>💬 Send Message</Link>
                  </div>
                </div>

                {/* Review section */}
                {selected.status==='completed' && activeTab==='asClient' && !selected.rating && (
                  <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>⭐ Leave a Review</div>
                    <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                      {[1,2,3,4,5].map(n => <button key={n} onClick={()=>setReview(r=>({...r,rating:n}))} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', opacity:review.rating>=n?1:0.3 }}>★</button>)}
                    </div>
                    <textarea value={review.review} onChange={e=>setReview(r=>({...r,review:e.target.value}))} rows={3} placeholder="Share your experience..." style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', color:'#fff', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif', resize:'vertical', marginBottom:10 }} />
                    <button onClick={()=>submitReview(selected._id)} disabled={submitting||!review.review} style={{ ...btnGold, width:'100%', opacity:(!review.review)?0.5:1 }}>{submitting?'Submitting...':'Submit Review'}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

const gold='#d4a853';
const btnGold={background:`linear-gradient(135deg,${gold},#b8860b)`,color:'#000',border:'none',borderRadius:8,padding:'11px',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'};
const btnGreen={background:'rgba(74,222,128,0.15)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80',borderRadius:8,padding:'11px',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'};
const btnRed={background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',borderRadius:8,padding:'11px',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'};
const btnOutline={background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',borderRadius:8,padding:'11px',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'};
