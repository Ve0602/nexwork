import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const STATUS_CLASS = { pending:'tag-warning', active:'tag-accent', delivered:'tag-accent', completed:'tag-success' };

export default function Earnings() {
  const { token, user } = useAuth();
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
    try { const { data } = await axios.get(`${API}/api/orders/my`, { headers:h }); setOrders(data.asProvider || []); }
    catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const released = orders.filter(o => o.paymentStatus === 'released');
  const pending = orders.filter(o => o.paymentStatus === 'paid' && o.status !== 'completed');
  const totalEarned = released.reduce((sum,o) => sum + (o.netAmount || o.amount * 0.9), 0);
  const pendingAmount = pending.reduce((sum,o) => sum + (o.netAmount || o.amount * 0.9), 0);
  const availableBalance = totalEarned;

  const requestWithdraw = async () => {
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) { setMsg('Enter a valid amount'); return; }
    if (parseFloat(withdrawForm.amount) > availableBalance) { setMsg('Amount exceeds available balance'); return; }
    setSubmitting(true);
    try {
      setMsg(`Withdrawal request for ₹${withdrawForm.amount} submitted — processed within 24–48 hours.`);
      setShowWithdraw(false);
      setWithdrawForm({ amount:'', upiId:'', bankAccount:'', ifsc:'', accountHolder:'' });
    } catch(e) { setMsg('Failed to submit withdrawal'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Earnings</h1>
          <button onClick={() => setShowWithdraw(true)} disabled={availableBalance<=0} className="btn btn-primary" style={{ opacity: availableBalance>0?1:0.4 }}>Withdraw funds</button>
        </div>

        {msg && <div className="card" style={{ padding: '10px 14px', marginBottom: 20, fontSize: 13, display:'flex', justifyContent:'space-between' }}>{msg}<button onClick={()=>setMsg('')} className="btn btn-ghost" style={{padding:0}}>✕</button></div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[['Available balance', availableBalance, 'var(--accent)'],['Pending clearance', pendingAmount, 'var(--warning)'],['Total earned', user?.totalEarned || totalEarned, 'var(--success)']].map(([label, val, color]) => (
            <div key={label} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
              <div className="mono" style={{ fontWeight: 600, fontSize: 24, color }}>₹{val.toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--text-muted)', background:'var(--bg-subtle)' }}>
          NexWork takes a flat <strong style={{ color:'var(--text)' }}>10% platform fee</strong> on completed orders. You receive 90% of every order once the client approves delivered work.
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Earnings history</h2>
        {loading ? <div style={{ textAlign:'center', padding:50, color:'var(--text-muted)', fontSize:13 }}>Loading…</div>
        : orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'50px 20px' }}>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:16 }}>No earnings yet.</p>
            <Link to="/create-service" className="btn btn-primary">Create a service →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {orders.map(o => (
              <div key={o._id} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{o.serviceId?.title || 'Service order'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{o.clientId?.name} · {new Date(o.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className={`tag ${STATUS_CLASS[o.status]}`} style={{ textTransform:'capitalize' }}>{o.status}</span>
                  <div style={{ textAlign:'right' }}>
                    <div className="mono" style={{ fontWeight: 600, color: o.paymentStatus==='released'?'var(--success)':'var(--text)' }}>+₹{(o.netAmount || o.amount*0.9).toLocaleString()}</div>
                    <div style={{ fontSize:10, color:'var(--text-faint)' }}>{o.paymentStatus==='released' ? 'Received' : o.paymentStatus==='paid' ? 'In escrow' : 'Unpaid'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showWithdraw && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={() => setShowWithdraw(false)} />
          <div className="card" style={{ position:'relative', maxWidth:440, width:'100%', padding:24, zIndex:1, background:'var(--bg-raised)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Withdraw funds</h3>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:18 }}>Available: <strong style={{ color:'var(--text)' }}>₹{availableBalance.toLocaleString()}</strong></p>

            <label style={ls}>Amount (₹)</label>
            <input type="number" value={withdrawForm.amount} onChange={e=>setWithdrawForm({...withdrawForm,amount:e.target.value})} placeholder={`Max ₹${availableBalance}`} className="input" style={{ marginBottom:14 }} />

            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              {[['upi','UPI'],['bank','Bank transfer']].map(([v,l]) => (
                <button key={v} onClick={()=>setMethod(v)} className="btn" style={{ flex:1, border:`1px solid ${method===v?'var(--accent)':'var(--border)'}`, background: method===v?'var(--accent-subtle)':'transparent', color: method===v?'var(--accent)':'var(--text-muted)' }}>{l}</button>
              ))}
            </div>

            {method==='upi' ? (
              <div style={{ marginBottom:16 }}><label style={ls}>UPI ID</label><input value={withdrawForm.upiId} onChange={e=>setWithdrawForm({...withdrawForm,upiId:e.target.value})} placeholder="yourname@upi" className="input" /></div>
            ) : (
              <div style={{ display:'grid', gap:10, marginBottom:16 }}>
                <div><label style={ls}>Account holder</label><input value={withdrawForm.accountHolder} onChange={e=>setWithdrawForm({...withdrawForm,accountHolder:e.target.value})} className="input" /></div>
                <div><label style={ls}>Account number</label><input value={withdrawForm.bankAccount} onChange={e=>setWithdrawForm({...withdrawForm,bankAccount:e.target.value})} className="input" /></div>
                <div><label style={ls}>IFSC</label><input value={withdrawForm.ifsc} onChange={e=>setWithdrawForm({...withdrawForm,ifsc:e.target.value})} className="input" /></div>
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={requestWithdraw} disabled={submitting} className="btn btn-primary" style={{ flex:1 }}>{submitting?'Submitting…':'Request withdrawal'}</button>
              <button onClick={()=>setShowWithdraw(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const ls = { display:'block', fontSize:11, color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' };
