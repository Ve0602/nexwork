import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Messages() {
  const { user, token } = useAuth();
  const [params] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv]   = useState(null);
  const [activeUser, setActiveUser]   = useState(null);
  const [messages, setMessages]       = useState([]);
  const [newMessage, setNewMessage]   = useState('');
  const [loading, setLoading]         = useState(true);
  const [sending, setSending]         = useState(false);
  const bottomRef = useRef(null);
  const h = { Authorization:`Bearer ${token}` };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    const toUser = params.get('to');
    if (toUser && toUser !== user?.id) {
      loadUserAndStart(toUser);
    }
  }, [params]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/messages/conversations`, { headers:h });
      setConversations(data || []);
    } catch(e) { console.log(e.message); }
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
    try {
      const { data } = await axios.get(`${API}/api/messages/${conversationId}`, { headers:h });
      setMessages(data || []);
    } catch(e) { console.log(e.message); }
  };

  const openConversation = async (conv) => {
    setActiveConv(conv._id);
    const otherId = conv.lastMessage.senderId === user.id ? conv.lastMessage.receiverId : conv.lastMessage.senderId;
    try {
      const { data } = await axios.get(`${API}/api/users/${otherId}`);
      setActiveUser(data);
    } catch(e){}
    loadMessages(conv._id);
  };

  const send = async () => {
    if (!newMessage.trim() || !activeUser) return;
    setSending(true);
    try {
      const receiverId = activeUser._id;
      const { data } = await axios.post(`${API}/api/messages`, { receiverId, content:newMessage }, { headers:h });
      setMessages(m => [...m, data]);
      setNewMessage('');
      loadConversations();
    } catch(e) { console.log(e.message); }
    finally { setSending(false); }
  };

  const gold = '#d4a853';

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', height:'calc(100vh - 64px)' }}>

        {/* Conversations list */}
        <div style={{ borderRight:'1px solid rgba(255,255,255,0.07)', overflowY:'auto' }}>
          <div style={{ padding:'20px 20px 14px' }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20 }}>💬 Messages</h2>
          </div>
          {loading ? <div style={{ textAlign:'center', padding:40, color:gold }}>Loading...</div>
          : conversations.length===0 && !activeUser ? (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>💬</div>
              <p style={{ fontSize:13 }}>No conversations yet.<br/>Message a freelancer or client to start!</p>
            </div>
          ) : (
            <div>
              {activeUser && !conversations.find(c=>c._id===activeConv) && (
                <div onClick={() => {}} style={{ padding:'12px 20px', background:'rgba(212,168,83,0.08)', borderLeft:`3px solid ${gold}`, cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {activeUser.photo ? <img src={activeUser.photo} alt="" style={{ width:38, height:38, borderRadius:'50%', objectFit:'cover' }} /> : <div style={{ width:38, height:38, borderRadius:'50%', background:`${gold}20`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:gold }}>{activeUser.name?.[0]}</div>}
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>{activeUser.name}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>New conversation</div>
                    </div>
                  </div>
                </div>
              )}
              {conversations.map(c => (
                <div key={c._id} onClick={() => openConversation(c)} style={{ padding:'12px 20px', background: activeConv===c._id ? 'rgba(212,168,83,0.08)' : 'transparent', borderLeft: activeConv===c._id ? `3px solid ${gold}` : '3px solid transparent', cursor:'pointer', transition:'background 0.15s' }}
                  onMouseEnter={e => { if(activeConv!==c._id) e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if(activeConv!==c._id) e.currentTarget.style.background='transparent'; }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:`${gold}20`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:gold, flexShrink:0 }}>👤</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Conversation</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.lastMessage?.content}</div>
                    </div>
                    {c.unreadCount > 0 && <div style={{ background:gold, color:'#000', fontSize:10, fontWeight:700, borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{c.unreadCount}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active conversation */}
        <div style={{ display:'flex', flexDirection:'column' }}>
          {activeUser ? (
            <>
              {/* Header */}
              <div style={{ padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:12 }}>
                {activeUser.photo ? <img src={activeUser.photo} alt="" style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover' }} /> : <div style={{ width:40, height:40, borderRadius:'50%', background:`${gold}20`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:gold }}>{activeUser.name?.[0]}</div>}
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{activeUser.name}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', textTransform:'capitalize' }}>{activeUser.primaryRole}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:10 }}>
                {messages.length === 0 && <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', padding:40, fontSize:13 }}>No messages yet. Say hello! 👋</div>}
                {messages.map(m => {
                  const isMe = m.senderId._id === user.id || m.senderId === user.id;
                  return (
                    <div key={m._id} style={{ display:'flex', justifyContent: isMe?'flex-end':'flex-start' }}>
                      <div style={{ maxWidth:'60%', background: isMe ? `linear-gradient(135deg,${gold},#b8860b)` : 'rgba(255,255,255,0.07)', color: isMe ? '#000' : '#fff', padding:'10px 14px', borderRadius:14, fontSize:13, lineHeight:1.5 }}>
                        {m.content}
                        <div style={{ fontSize:10, opacity:0.6, marginTop:4 }}>{new Date(m.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding:'16px 24px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:10 }}>
                <input value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type a message..." style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'11px 18px', color:'#fff', fontSize:14, outline:'none', fontFamily:'DM Sans,sans-serif' }} />
                <button onClick={send} disabled={sending||!newMessage.trim()} style={{ background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:'50%', width:42, height:42, cursor:'pointer', fontSize:16, flexShrink:0, opacity:(!newMessage.trim())?0.5:1 }}>➤</button>
              </div>
            </>
          ) : (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize:60, marginBottom:16 }}>💬</div>
              <p style={{ fontSize:15 }}>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}
