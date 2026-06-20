import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Notifications() {
  const { token } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/notifications`, { headers:h });
      setNotifs(data || []);
    } catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${API}/api/notifications/${id}/read`, {}, { headers:h });
      setNotifs(n => n.map(x => x._id===id ? {...x,isRead:true} : x));
    } catch(e) {}
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API}/api/notifications/read-all`, {}, { headers:h });
      setNotifs(n => n.map(x => ({...x,isRead:true})));
    } catch(e) {}
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

  const gold = '#d4a853';
  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ maxWidth:680, margin:'0 auto', padding:'32px 20px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:26 }}>🔔 Notifications</h1>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:4 }}>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
          </div>
          {unreadCount > 0 && <button onClick={markAllRead} style={{ background:'rgba(255,255,255,0.06)', border:'none', color:'rgba(255,255,255,0.5)', borderRadius:8, padding:'8px 16px', fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Mark all read</button>}
        </div>

        {loading ? <div style={{ textAlign:'center', padding:60, color:gold }}>Loading...</div>
        : notifs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:52, marginBottom:16 }}>🔔</div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:18, marginBottom:8 }}>No notifications yet</h3>
            <p style={{ color:'rgba(255,255,255,0.4)' }}>You'll see updates about orders, messages, and proposals here</p>
          </div>
        ) : (
          <div style={{ display:'grid', gap:8 }}>
            {notifs.map(n => (
              <Link key={n._id} to={n.link || '#'} onClick={() => !n.isRead && markRead(n._id)} style={{ textDecoration:'none', background: n.isRead ? 'rgba(255,255,255,0.02)' : `${gold}08`, border:`1px solid ${n.isRead ? 'rgba(255,255,255,0.06)' : `${gold}25`}`, borderRadius:12, padding:'14px 18px', display:'flex', gap:12, alignItems:'flex-start', transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${gold}40`}
                onMouseLeave={e => e.currentTarget.style.borderColor = n.isRead ? 'rgba(255,255,255,0.06)' : `${gold}25`}>
                <div style={{ fontSize:22, flexShrink:0 }}>{n.icon || '🔔'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color: n.isRead ? 'rgba(255,255,255,0.6)' : '#fff', marginBottom:3 }}>{n.title}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.5 }}>{n.message}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:6 }}>{timeAgo(n.createdAt)}</div>
                </div>
                {!n.isRead && <div style={{ width:8, height:8, borderRadius:'50%', background:gold, flexShrink:0, marginTop:6 }} />}
              </Link>
            ))}
          </div>
        )}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}
