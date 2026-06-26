import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Messages() {
  const { user, token } = useAuth();
  const [params] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { const toUser = params.get('to'); if (toUser && toUser !== user?.id) loadUserAndStart(toUser); }, [params]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    try { const { data } = await axios.get(`${API}/api/messages/conversations`, { headers:h }); setConversations(data || []); }
    catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const loadUserAndStart = async (userId) => {
    try {
      const { data } = await axios.get(`${API}/api/users/${userId}`);
      setActiveUser(data);
      const conversationId = [user.id, userId].sort().join('_');
      setActiveConv(conversationId);
      loadMessages(conversationId);
    } catch(e) { console.log(e.message); }
  };

  const loadMessages = async (conversationId) => {
    try { const { data } = await axios.get(`${API}/api/messages/${conversationId}`, { headers:h }); setMessages(data || []); }
    catch(e) { console.log(e.message); }
  };

  const openConversation = async (conv) => {
    setActiveConv(conv._id);
    const otherId = conv.lastMessage.senderId === user.id ? conv.lastMessage.receiverId : conv.lastMessage.senderId;
    try { const { data } = await axios.get(`${API}/api/users/${otherId}`); setActiveUser(data); } catch(e){}
    loadMessages(conv._id);
  };

  const send = async () => {
    if (!newMessage.trim() || !activeUser) return;
    setSending(true);
    try {
      const { data } = await axios.post(`${API}/api/messages`, { receiverId: activeUser._id, content:newMessage }, { headers:h });
      setMessages(m => [...m, data]);
      setNewMessage('');
      loadConversations();
    } catch(e) { console.log(e.message); }
    finally { setSending(false); }
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', height:'calc(100vh - 56px)' }}>

        <div style={{ borderRight:'1px solid var(--border)', overflowY:'auto' }}>
          <div style={{ padding:'18px 20px 12px' }}><h2 style={{ fontSize:16, fontWeight:600 }}>Messages</h2></div>
          {loading ? <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)', fontSize:13 }}>Loading…</div>
          : conversations.length===0 && !activeUser ? (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-faint)', fontSize:13 }}>No conversations yet.</div>
          ) : (
            <div>
              {activeUser && !conversations.find(c=>c._id===activeConv) && (
                <div style={{ padding:'12px 20px', background:'var(--accent-subtle)', borderLeft:'2px solid var(--accent)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {activeUser.photo ? <img src={activeUser.photo} alt="" style={{ width:34, height:34, borderRadius:'50%', objectFit:'cover' }} /> : <div className="mono" style={{ width:34, height:34, borderRadius:'50%', background:'var(--accent-subtle)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:13 }}>{activeUser.name?.[0]}</div>}
                    <div><div style={{ fontWeight:600, fontSize:13 }}>{activeUser.name}</div><div style={{ fontSize:11, color:'var(--text-faint)' }}>New conversation</div></div>
                  </div>
                </div>
              )}
              {conversations.map(c => (
                <div key={c._id} onClick={() => openConversation(c)} style={{ padding:'12px 20px', background: activeConv===c._id ? 'var(--accent-subtle)' : 'transparent', borderLeft: activeConv===c._id ? '2px solid var(--accent)' : '2px solid transparent', cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="mono" style={{ width:34, height:34, borderRadius:'50%', background:'var(--accent-subtle)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:13, flexShrink:0 }}>·</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>Conversation</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.lastMessage?.content}</div>
                    </div>
                    {c.unreadCount > 0 && <div className="mono" style={{ background:'var(--accent)', color:'#fff', fontSize:10, fontWeight:600, borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{c.unreadCount}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display:'flex', flexDirection:'column' }}>
          {activeUser ? (
            <>
              <div style={{ padding:'14px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
                {activeUser.photo ? <img src={activeUser.photo} alt="" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover' }} /> : <div className="mono" style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent-subtle)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600 }}>{activeUser.name?.[0]}</div>}
                <div><div style={{ fontWeight:600, fontSize:14 }}>{activeUser.name}</div><div style={{ fontSize:12, color:'var(--text-faint)', textTransform:'capitalize' }}>{activeUser.primaryRole}</div></div>
              </div>

              <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:10 }}>
                {messages.length === 0 && <div style={{ textAlign:'center', color:'var(--text-faint)', padding:40, fontSize:13 }}>No messages yet</div>}
                {messages.map(m => {
                  const isMe = m.senderId._id === user.id || m.senderId === user.id;
                  return (
                    <div key={m._id} style={{ display:'flex', justifyContent: isMe?'flex-end':'flex-start' }}>
                      <div style={{ maxWidth:'60%', background: isMe ? 'var(--accent)' : 'var(--bg-subtle)', color: isMe ? '#fff' : 'var(--text)', padding:'10px 14px', borderRadius:10, fontSize:13, lineHeight:1.5 }}>
                        {m.content}
                        <div style={{ fontSize:10, opacity:0.7, marginTop:4 }}>{new Date(m.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div style={{ padding:'14px 24px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
                <input value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type a message…" className="input" style={{ borderRadius:20 }} />
                <button onClick={send} disabled={sending||!newMessage.trim()} className="btn btn-primary" style={{ borderRadius:'50%', width:38, height:38, padding:0, flexShrink:0 }}>→</button>
              </div>
            </>
          ) : (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-faint)', fontSize:13 }}>Select a conversation</div>
          )}
        </div>
      </div>
    </div>
  );
}
