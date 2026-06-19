import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const TABS = ['Dashboard','Users','Orders','Services','Settings'];
const ICONS = { Dashboard:'📊', Users:'👥', Orders:'📦', Services:'⚙️', Settings:'🔧' };

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => {
    if (user && !user.roles?.includes('admin')) navigate('/dashboard');
  }, [user]);

  const gold = '#d4a853';

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1a1208,#07070f)', borderBottom:'1px solid rgba(212,168,83,0.15)', padding:'24px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:26 }}>⚙️ Admin Control Center</h1>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:4 }}>NexWork Platform Management</p>
          </div>
          <button onClick={()=>navigate('/dashboard')} style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'rgba(255,255,255,0.5)', borderRadius:9, padding:'9px 18px', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:13 }}>← Back to App</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginTop:20 }}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{ background:'none', border:'none', padding:'10px 18px', fontSize:13, fontWeight:600, color: tab===t?gold:'rgba(255,255,255,0.4)', borderBottom: tab===t?`2px solid ${gold}`:'2px solid transparent', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
              {ICONS[t]} {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'28px 40px' }}>
        {tab==='Dashboard' && <DashboardTab h={h} API={API} gold={gold} />}
        {tab==='Users'     && <UsersTab h={h} API={API} gold={gold} />}
        {tab==='Orders'    && <OrdersTab h={h} API={API} gold={gold} />}
        {tab==='Services'  && <ServicesTab h={h} API={API} gold={gold} />}
        {tab==='Settings'  && <SettingsTab gold={gold} />}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

// ── DASHBOARD TAB ─────────────────────────────────────────────
function DashboardTab({ h, API, gold }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const { data } = await axios.get(`${API}/api/admin/stats`, { headers:h }); setStats(data); }
    catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  if (loading) return <div style={{ textAlign:'center', padding:60, color:gold }}>Loading stats...</div>;
  if (!stats) return <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,0.3)' }}>Failed to load stats</div>;

  const cards = [
    { label:'Total Users', value:stats.users, icon:'👥', color:'#00d4ff' },
    { label:'Projects Posted', value:stats.projects, icon:'💼', color:'#7c3aed' },
    { label:'Active Services', value:stats.services, icon:'🛍️', color:'#e91e8c' },
    { label:'Total Orders', value:stats.orders, icon:'📦', color:gold },
    { label:'Active Jobs', value:stats.jobs, icon:'🔍', color:'#10b981' },
    { label:'Revenue', value:`₹${stats.revenue?.toLocaleString()||0}`, icon:'💰', color:'#4ade80' },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${c.color}25`, borderRadius:14, padding:'20px 18px' }}>
            <div style={{ fontSize:24, marginBottom:10 }}>{c.icon}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24, color:c.color }}>{c.value}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Recent users */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:20 }}>
          <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:14 }}>👥 Recent Signups</h3>
          {stats.recentUsers?.length===0 ? <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>No users yet</p> : stats.recentUsers?.map(u => (
            <div key={u._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              {u.photo ? <img src={u.photo} alt="" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover' }} /> : <div style={{ width:32, height:32, borderRadius:'50%', background:`${gold}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:gold }}>{u.name?.[0]}</div>}
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{u.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{u.email} · {u.primaryRole}</div>
              </div>
              {u.isVerified && <span style={{ fontSize:10, color:'#4ade80' }}>✓</span>}
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:20 }}>
          <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:14 }}>📦 Recent Orders</h3>
          {stats.recentOrders?.length===0 ? <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>No orders yet</p> : stats.recentOrders?.map(o => (
            <div key={o._id} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{o.serviceId?.title||'Service'}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{o.clientId?.name} → {o.providerId?.name}</div>
              </div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:gold }}>₹{o.amount?.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── USERS TAB ─────────────────────────────────────────────────
function UsersTab({ h, API, gold }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ limit:50 });
      if (search) q.set('search', search);
      const { data } = await axios.get(`${API}/api/admin/users?${q}`, { headers:h });
      setUsers(data.users||[]); setTotal(data.total||0);
    } catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const verify = async (id, isVerified) => {
    try {
      await axios.put(`${API}/api/admin/users/${id}/verify`, { isVerified }, { headers:h });
      setUsers(u => u.map(x => x._id===id ? {...x,isVerified} : x));
      setMsg('✅ Updated');
    } catch(e) { setMsg('❌ Failed'); }
  };

  const setPlan = async (id, plan) => {
    try {
      await axios.put(`${API}/api/admin/users/${id}/plan`, { plan }, { headers:h });
      setUsers(u => u.map(x => x._id===id ? {...x,plan} : x));
    } catch(e) {}
  };

  const del = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try { await axios.delete(`${API}/api/admin/users/${id}`, { headers:h }); setUsers(u=>u.filter(x=>x._id!==id)); }
    catch(e) { setMsg('❌ Delete failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20 }}>👥 Users ({total})</h2>
      </div>
      {msg && <div style={{ background:'rgba(74,222,128,0.1)', color:'#4ade80', padding:'8px 14px', borderRadius:8, fontSize:13, marginBottom:14 }}>{msg}</div>}
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Search by name or email..." style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 14px', color:'#fff', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif' }} />
        <button onClick={load} style={{ background:gold, color:'#000', border:'none', borderRadius:8, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Search</button>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:40, color:gold }}>Loading...</div> : (
        <div style={{ display:'grid', gap:10 }}>
          {users.map(u => (
            <div key={u._id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
              {u.photo ? <img src={u.photo} alt="" style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover' }} /> : <div style={{ width:40, height:40, borderRadius:'50%', background:`${gold}20`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:gold }}>{u.name?.[0]}</div>}
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{u.name} {u.isVerified && <span style={{ color:'#4ade80', fontSize:11 }}>✓ Verified</span>}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{u.email} · <span style={{ textTransform:'capitalize' }}>{u.primaryRole}</span></div>
              </div>
              <select value={u.plan} onChange={e=>setPlan(u._id,e.target.value)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:7, padding:'6px 10px', color:'#fff', fontSize:12, outline:'none', fontFamily:'DM Sans,sans-serif' }}>
                <option value="free">Free</option><option value="basic">Basic</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
              </select>
              <button onClick={()=>verify(u._id,!u.isVerified)} style={{ background:u.isVerified?'rgba(239,68,68,0.1)':'rgba(74,222,128,0.1)', border:'none', color:u.isVerified?'#f87171':'#4ade80', borderRadius:7, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>{u.isVerified?'Unverify':'Verify'}</button>
              <button onClick={()=>del(u._id)} style={{ background:'rgba(239,68,68,0.1)', border:'none', color:'#f87171', borderRadius:7, padding:'7px 10px', fontSize:12, cursor:'pointer' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ORDERS TAB ────────────────────────────────────────────────
function OrdersTab({ h, API, gold }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/admin/orders`, { headers:h }).then(r=>setOrders(r.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const statusColors = { pending:'#f59e0b', active:'#00d4ff', delivered:'#7c3aed', completed:'#4ade80', cancelled:'#f87171', disputed:'#f87171', refunded:'#a78bfa' };

  return (
    <div>
      <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, marginBottom:18 }}>📦 Orders ({orders.length})</h2>
      {loading ? <div style={{ textAlign:'center', padding:40, color:gold }}>Loading...</div>
      : orders.length===0 ? <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,0.3)' }}>No orders yet</div>
      : (
        <div style={{ display:'grid', gap:10 }}>
          {orders.map(o => (
            <div key={o._id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'16px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{o.serviceId?.title||'Service Order'}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{o.clientId?.name} ({o.clientId?.email}) → {o.providerId?.name} ({o.providerId?.email})</div>
              </div>
              <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                <span style={{ background:`${statusColors[o.status]}18`, color:statusColors[o.status], fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:10, textTransform:'capitalize' }}>{o.status}</span>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color:gold }}>₹{o.amount?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SERVICES TAB ──────────────────────────────────────────────
function ServicesTab({ h, API, gold }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/services?limit=50`).then(r=>setServices(r.data.services||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const toggleFeature = async (id, isFeatured) => {
    try {
      await axios.put(`${API}/api/admin/services/${id}/feature`, { isFeatured }, { headers:h });
      setServices(s => s.map(x => x._id===id ? {...x,isFeatured} : x));
    } catch(e) {}
  };

  return (
    <div>
      <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, marginBottom:18 }}>🛍️ Services ({services.length})</h2>
      {loading ? <div style={{ textAlign:'center', padding:40, color:gold }}>Loading...</div> : (
        <div style={{ display:'grid', gap:10 }}>
          {services.map(s => (
            <div key={s._id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{s.title}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{s.category} · {s.providerId?.name} · {s.orderCount} orders</div>
              </div>
              <button onClick={()=>toggleFeature(s._id,!s.isFeatured)} style={{ background:s.isFeatured?`${gold}20`:'rgba(255,255,255,0.06)', border:`1px solid ${s.isFeatured?gold:'rgba(255,255,255,0.1)'}`, color:s.isFeatured?gold:'rgba(255,255,255,0.5)', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>{s.isFeatured?'⭐ Featured':'Feature it'}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SETTINGS TAB ──────────────────────────────────────────────
function SettingsTab({ gold }) {
  return (
    <div style={{ maxWidth:600 }}>
      <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, marginBottom:18 }}>🔧 Platform Settings</h2>
      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:24 }}>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.8 }}>
          Platform-wide settings like commission rate, payment gateway configuration, and content moderation rules will appear here in a future update.
        </p>
        <div style={{ marginTop:16, padding:'14px 18px', background:`${gold}08`, border:`1px solid ${gold}20`, borderRadius:10 }}>
          <div style={{ fontWeight:700, color:gold, marginBottom:6, fontSize:13 }}>Current Commission Rate</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24 }}>10%</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 }}>Applied to all service orders</div>
        </div>
      </div>
    </div>
  );
}
