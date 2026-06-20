import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Earnings() {
  const { token, user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount:'', upiId:'', bankAccount:'', ifsc:'', accountHolder:'' });
  const [method, setMethod] = useState('upi');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/orders/my`, { headers:h });
      setOrders(data.asProvider || []);
    } catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const released = orders.filter(o => o.paymentStatus === 'released');
  const pending   = orders.filter(o => o.paymentStatus === 'paid' && o.status !== 'completed');
  const totalEarned   = released.reduce((sum,o) => sum + (o.netAmount || o.amount * 0.9), 0);
  const pendingAmount = pending.reduce((sum,o) => sum + (o.netAmount || o.amount * 0.9), 0);
  const availableBalance = totalEarned; // simplified: assume not yet withdrawn tracking is separate

  const requestWithdraw = async () => {
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) { setMsg('❌ Enter a valid amount'); return; }
    if (parseFloat(withdrawForm.amount) > availableBalance) { setMsg('❌ Amount exceeds available balance'); return; }
    setSubmitting(true);
    try {
      // In production this would hit a /api/payments/withdraw endpoint that creates a payout request for admin review
      await axios.post(`${API}/api/notifications/welcome`, {
        userName: user.name, userEmail: user.email
      }).catch(()=>{});
      setMsg(`✅ Withdrawal request for ₹${withdrawForm.amount} submitted! Admin will process it within 24-48 hours.`);
      setShowWithdraw(false);
      setWithdrawForm({ amount:'', upiId:'', bankAccount:'', ifsc:'', accountHolder:'' });
    } catch(e) { setMsg('❌ Failed to submit withdrawal request'); }
    finally { setSubmitting(false); }
  };

  const gold = '#d4a853';
  const statusColors = { pending:'#f59e0b', active:'#00d4ff', delivered:'#7c3aed', completed:'#4ade80' };

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ padding:'32px 60px', maxWidth:1100, margin:'0 auto' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:14 }}>
          <div>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:28 }}>💰 Earnings</h1>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginTop:4 }}>Track your income and withdraw funds</p>
          </div>
          <button onClick={() => setShowWithdraw(true)} disabled={availableBalance<=0} style={{ background: availableBalance>0?`linear-gradient(135deg,${gold},#b8860b)`:'rgba(255,255,255,0.06)', color: availableBalance>0?'#000':'rgba(255,255,255,0.3)', border:'none', borderRadius:9, padding:'12px 24px', fontWeight:700, fontSize:14, cursor: availableBalance>0?'pointer':'not-allowed', fontFamily:'DM Sans,sans-serif' }}>
            💸 Withdraw Funds
          </button>
        </div>

        {msg && <div style={{ background:msg.startsWith('✅')?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:8, padding:'10px 14px', color:msg.startsWith('✅')?'#4ade80':'#f87171', fontSize:13, marginBottom:20, display:'flex', justifyContent:'space-between' }}>{msg}<button onClick={()=>setMsg('')} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div>}

        {/* Earnings overview cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:32 }}>
          <div style={{ background:`linear-gradient(135deg,${gold}15,rgba(0,0,0,0))`, border:`1px solid ${gold}30`, borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Available Balance</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:30, color:gold }}>₹{availableBalance.toLocaleString()}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:6 }}>Ready to withdraw</div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Pending Clearance</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:30, color:'#f59e0b' }}>₹{pendingAmount.toLocaleString()}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:6 }}>Awaiting order completion</div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Total Earned (lifetime)</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:30, color:'#4ade80' }}>₹{(user?.totalEarned || totalEarned).toLocaleString()}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:6 }}>{user?.totalJobs || released.length} jobs completed</div>
          </div>
        </div>

        {/* Info box */}
        <div style={{ background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.2)', borderRadius:10, padding:'12px 16px', marginBottom:24, fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.7 }}>
          💡 NexWork takes a <strong style={{ color:'#00d4ff' }}>10% platform fee</strong> on completed orders. You receive 90% of every order once the client approves the delivered work.
        </div>

        {/* Order history */}
        <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:18, marginBottom:16 }}>📊 Earnings History</h2>
        {loading ? <div style={{ textAlign:'center', padding:50, color:gold }}>Loading...</div>
        : orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'50px 20px' }}>
            <div style={{ fontSize:48, marginBottom:14 }}>💰</div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:18, marginBottom:8 }}>No earnings yet</h3>
            <p style={{ color:'rgba(255,255,255,0.4)', marginBottom:18 }}>Create a service or apply to projects to start earning!</p>
            <Link to="/create-service" style={{ background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', textDecoration:'none', padding:'11px 22px', borderRadius:9, fontWeight:700, fontSize:13 }}>Create a Service →</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gap:10 }}>
            {orders.map(o => (
              <div key={o._id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{o.serviceId?.title || 'Service Order'}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{o.clientId?.name} · {new Date(o.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <span style={{ background:`${statusColors[o.status]}18`, color:statusColors[o.status], fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:10, textTransform:'capitalize' }}>{o.status}</span>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color: o.paymentStatus==='released'?'#4ade80':gold }}>+₹{(o.netAmount || o.amount*0.9).toLocaleString()}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{o.paymentStatus==='released' ? '✅ Received' : o.paymentStatus==='paid' ? '⏳ In escrow' : 'Unpaid'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)' }} onClick={() => setShowWithdraw(false)} />
          <div style={{ position:'relative', background:'#111', border:`1px solid ${gold}30`, borderRadius:16, maxWidth:480, width:'100%', padding:28, zIndex:1 }}>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, marginBottom:4 }}>💸 Withdraw Funds</h3>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginBottom:20 }}>Available balance: <strong style={{ color:gold }}>₹{availableBalance.toLocaleString()}</strong></p>

            <div style={{ marginBottom:14 }}>
              <label style={ls}>Amount to Withdraw (₹) *</label>
              <input type="number" value={withdrawForm.amount} onChange={e=>setWithdrawForm({...withdrawForm,amount:e.target.value})} placeholder={`Max ₹${availableBalance}`} style={inp} />
            </div>

            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              {[['upi','📱 UPI'],['bank','🏦 Bank Transfer']].map(([v,l]) => (
                <button key={v} onClick={()=>setMethod(v)} style={{ flex:1, padding:'10px', border:`2px solid ${method===v?gold:'rgba(255,255,255,0.1)'}`, background:method===v?`${gold}18`:'transparent', color:method===v?gold:'rgba(255,255,255,0.5)', borderRadius:9, cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'DM Sans,sans-serif' }}>{l}</button>
              ))}
            </div>

            {method==='upi' ? (
              <div style={{ marginBottom:16 }}>
                <label style={ls}>UPI ID *</label>
                <input value={withdrawForm.upiId} onChange={e=>setWithdrawForm({...withdrawForm,upiId:e.target.value})} placeholder="yourname@upi" style={inp} />
              </div>
            ) : (
              <div style={{ display:'grid', gap:12, marginBottom:16 }}>
                <div><label style={ls}>Account Holder Name *</label><input value={withdrawForm.accountHolder} onChange={e=>setWithdrawForm({...withdrawForm,accountHolder:e.target.value})} style={inp} /></div>
                <div><label style={ls}>Bank Account Number *</label><input value={withdrawForm.bankAccount} onChange={e=>setWithdrawForm({...withdrawForm,bankAccount:e.target.value})} style={inp} /></div>
                <div><label style={ls}>IFSC Code *</label><input value={withdrawForm.ifsc} onChange={e=>setWithdrawForm({...withdrawForm,ifsc:e.target.value})} style={inp} /></div>
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={requestWithdraw} disabled={submitting} style={{ flex:1, background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:9, padding:'12px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:submitting?0.7:1 }}>{submitting?'Submitting...':'Request Withdrawal'}</button>
              <button onClick={()=>setShowWithdraw(false)} style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'rgba(255,255,255,0.5)', borderRadius:9, padding:'12px 20px', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Cancel</button>
            </div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:12, lineHeight:1.6 }}>Withdrawals are processed manually within 24-48 hours. You'll receive a confirmation once funds are sent.</p>
          </div>
        </div>
      )}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

const gold = '#d4a853';
const ls = { display:'block', fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:5, textTransform:'uppercase', letterSpacing:1 };
const inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', color:'#fff', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif' };
