import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Notifications() {
  const { token } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { const { data } = await axios.get(`${API}/api/notifications`, { headers:h }); setNotifs(data || []); }
    catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try { await axios.put(`${API}/api/notifications/${id}/read`, {}, { headers:h }); setNotifs(n => n.map(x => x._id===id ? {...x,isRead:true} : x)); }
    catch(e) {}
  };

  const markAllRead = async () => {
    try { await axios.put(`${API}/api/notifications/read-all`, {}, { headers:h }); setNotifs(n => n.map(x => ({...x,isRead:true}))); }
    catch(e) {}
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff/60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth:640, margin:'0 auto', padding:'32px 24px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>Notifications</h1>
            <p style={{ color:'var(--text-faint)', fontSize:12, marginTop:4 }}>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
          </div>
          {unreadCount > 0 && <button onClick={markAllRead} className="btn btn-secondary">Mark all read</button>}
        </div>

        {loading ? <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontSize:13 }}>Loading…</div>
        : notifs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>No notifications yet. You'll see updates about orders, messages, and proposals here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 6 }}>
            {notifs.map(n => (
              <Link key={n._id} to={n.link || '#'} onClick={() => !n.isRead && markRead(n._id)} className="card" style={{ textDecoration:'none', padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start', background: n.isRead ? 'var(--bg-raised)' : 'var(--accent-subtle)', borderColor: n.isRead ? 'var(--border)' : 'transparent' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13, color: n.isRead ? 'var(--text-muted)' : 'var(--text)', marginBottom:3 }}>{n.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{n.message}</div>
                  <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:6 }}>{timeAgo(n.createdAt)}</div>
                </div>
                {!n.isRead && <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)', flexShrink:0, marginTop:5 }} />}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
