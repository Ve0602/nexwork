import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const TABS = ['Dashboard','Users','Orders','Services','Settings'];

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => { if (user && !user.roles?.includes('admin')) navigate('/dashboard'); }, [user]);

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ borderBottom:'1px solid var(--border)', padding:'20px 24px' }}>
        <div style={{ maxWidth: 1100, margin:'0 auto' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Admin</h1>
          <div style={{ display: 'flex', gap: 4, marginTop: 16 }}>
            {TABS.map(t => (
              <button key={t} onClick={()=>setTab(t)} style={{ background:'none', border:'none', padding:'9px 16px', fontSize:13, fontWeight:500, color: tab===t?'var(--accent)':'var(--text-muted)', borderBottom: tab===t?'2px solid var(--accent)':'2px solid transparent', cursor:'pointer' }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin:'0 auto', padding:'28px 24px' }}>
        {tab==='Dashboard' && <DashboardTab h={h} />}
        {tab==='Users'     && <UsersTab h={h} />}
        {tab==='Orders'    && <OrdersTab h={h} />}
        {tab==='Services'  && <ServicesTab h={h} />}
        {tab==='Settings'  && <SettingsTab />}
      </div>
    </div>
  );
}

function DashboardTab({ h }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const { data } = await axios.get(`${API}/api/admin/stats`, { headers:h }); setStats(data); }
    catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontSize:13 }}>Loading…</div>;
  if (!stats) return <div style={{ textAlign:'center', padding:60, color:'var(--text-faint)', fontSize:13 }}>Failed to load stats</div>;

  const cards = [
    ['Total users', stats.users], ['Projects posted', stats.projects], ['Active services', stats.services],
    ['Total orders', stats.orders], ['Active jobs', stats.jobs], ['Revenue', `₹${stats.revenue?.toLocaleString()||0}`],
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {cards.map(([label, value]) => (
          <div key={label} className="card" style={{ padding: '16px 18px' }}>
            <div className="mono" style={{ fontWeight: 600, fontSize: 22 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recent signups</h3>
          {stats.recentUsers?.length===0 ? <p style={{ color:'var(--text-faint)', fontSize:13 }}>No users yet</p> : stats.recentUsers?.map(u => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="mono" style={{ width:28, height:28, borderRadius:'50%', background:'var(--accent-subtle)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600 }}>{u.name?.[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{u.email} · {u.primaryRole}</div>
              </div>
              {u.isVerified && <span className="tag tag-success" style={{ fontSize: 10 }}>Verified</span>}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recent orders</h3>
          {stats.recentOrders?.length===0 ? <p style={{ color:'var(--text-faint)', fontSize:13 }}>No orders yet</p> : stats.recentOrders?.map(o => (
            <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{o.serviceId?.title||'Service'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{o.clientId?.name} → {o.providerId?.name}</div>
              </div>
              <div className="mono" style={{ fontWeight: 600, fontSize: 13 }}>₹{o.amount?.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsersTab({ h }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { const q = new URLSearchParams({ limit:50 }); if (search) q.set('search', search); const { data } = await axios.get(`${API}/api/admin/users?${q}`, { headers:h }); setUsers(data.users||[]); setTotal(data.total||0); }
    catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const verify = async (id, isVerified) => { try { await axios.put(`${API}/api/admin/users/${id}/verify`, { isVerified }, { headers:h }); setUsers(u => u.map(x => x._id===id ? {...x,isVerified} : x)); setMsg('Updated'); } catch(e) { setMsg('Failed'); } };
  const setPlan = async (id, plan) => { try { await axios.put(`${API}/api/admin/users/${id}/plan`, { plan }, { headers:h }); setUsers(u => u.map(x => x._id===id ? {...x,plan} : x)); } catch(e) {} };
  const del = async (id) => { if (!window.confirm('Delete this user permanently?')) return; try { await axios.delete(`${API}/api/admin/users/${id}`, { headers:h }); setUsers(u=>u.filter(x=>x._id!==id)); } catch(e) { setMsg('Delete failed'); } };

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Users ({total})</h2>
      {msg && <div className="card" style={{ padding:'8px 14px', marginBottom:14, fontSize:13 }}>{msg}</div>}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Search by name or email…" className="input" />
        <button onClick={load} className="btn btn-primary">Search</button>
      </div>
      {loading ? <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)', fontSize:13 }}>Loading…</div> : (
        <div style={{ display: 'grid', gap: 8 }}>
          {users.map(u => (
            <div key={u._id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div className="mono" style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent-subtle)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600 }}>{u.name?.[0]}</div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name} {u.isVerified && <span style={{ color:'var(--success)', fontSize:11 }}>· verified</span>}</div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{u.email} · {u.primaryRole}</div>
              </div>
              <select value={u.plan} onChange={e=>setPlan(u._id,e.target.value)} className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }}>
                <option value="free">Free</option><option value="basic">Basic</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
              </select>
              <button onClick={()=>verify(u._id,!u.isVerified)} className="btn btn-secondary">{u.isVerified?'Unverify':'Verify'}</button>
              <button onClick={()=>del(u._id)} className="btn btn-ghost" style={{ color:'var(--danger)' }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersTab({ h }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { axios.get(`${API}/api/admin/orders`, { headers:h }).then(r=>setOrders(r.data||[])).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Orders ({orders.length})</h2>
      {loading ? <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)', fontSize:13 }}>Loading…</div>
      : orders.length===0 ? <div style={{ textAlign:'center', padding:60, color:'var(--text-faint)', fontSize:13 }}>No orders yet</div>
      : (
        <div style={{ display: 'grid', gap: 8 }}>
          {orders.map(o => (
            <div key={o._id} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{o.serviceId?.title||'Service order'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{o.clientId?.name} → {o.providerId?.name}</div>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span className="tag" style={{ textTransform:'capitalize' }}>{o.status}</span>
                <div className="mono" style={{ fontWeight: 600 }}>₹{o.amount?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesTab({ h }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { axios.get(`${API}/api/services?limit=50`).then(r=>setServices(r.data.services||[])).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const toggleFeature = async (id, isFeatured) => { try { await axios.put(`${API}/api/admin/services/${id}/feature`, { isFeatured }, { headers:h }); setServices(s => s.map(x => x._id===id ? {...x,isFeatured} : x)); } catch(e) {} };

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Services ({services.length})</h2>
      {loading ? <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)', fontSize:13 }}>Loading…</div> : (
        <div style={{ display: 'grid', gap: 8 }}>
          {services.map(s => (
            <div key={s._id} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{s.category} · {s.providerId?.name} · {s.orderCount} orders</div>
              </div>
              <button onClick={()=>toggleFeature(s._id,!s.isFeatured)} className={s.isFeatured ? 'tag tag-accent' : 'btn btn-secondary'} style={{ cursor:'pointer' }}>{s.isFeatured?'Featured':'Feature it'}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  return (
    <div style={{ maxWidth:560 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Platform settings</h2>
      <div className="card" style={{ padding: 20 }}>
        <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.7, marginBottom: 16 }}>Commission rate, payment gateway, and moderation rules will appear here in a future update.</p>
        <div className="card" style={{ padding:'14px 16px', background:'var(--bg-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 4 }}>Current commission rate</div>
          <div className="mono" style={{ fontWeight: 600, fontSize: 22 }}>10%</div>
        </div>
      </div>
    </div>
  );
}
