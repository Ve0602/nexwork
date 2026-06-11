import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, token, logout, API } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [jobs, setJobs]         = useState([]);
  const [notifs, setNotifs]     = useState([]);
  const [aiTip, setAiTip]       = useState('');
  const [loadingTip, setLoadingTip] = useState(false);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user) return navigate('/login');
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      const [pRes, sRes, jRes, nRes] = await Promise.all([
        axios.get(`${API}/api/projects?limit=6`),
        axios.get(`${API}/api/services?limit=6`),
        axios.get(`${API}/api/jobs?limit=4`),
        axios.get(`${API}/api/users/notifications/all`, { headers: h }),
      ]);
      setProjects(pRes.data.projects || []);
      setServices(sRes.data.services || []);
      setJobs(jRes.data.jobs || []);
      setNotifs(nRes.data || []);
    } catch (e) { console.log('Dashboard load error:', e.message); }
  };

  const getAITip = async () => {
    setLoadingTip(true);
    try {
      const { data } = await axios.post(`${API}/api/ai/career-coach`,
        { question: `Give me one specific actionable tip to grow my career as a ${user.primaryRole} with skills: ${(user.skills||[]).map(s=>s.name).join(', ')}. Keep it under 3 sentences.`, userProfile: user },
        { headers: h }
      );
      setAiTip(data.answer);
    } catch (e) { setAiTip('Keep building your skills and stay consistent. Success comes to those who persist!'); }
    finally { setLoadingTip(false); }
  };

  if (!user) return null;

  const gold = '#d4a853';
  const roleColors = { freelancer:gold, client:'#7c3aed', student:'#00d4ff', jobseeker:'#10b981', service_provider:'#e91e8c', mentor:'#f59e0b', recruiter:'#6366f1', professional:'#14b8a6', admin:'#f87171' };
  const rc = roleColors[user.primaryRole] || gold;

  const quickLinks = {
    freelancer:       [['💼 Browse Projects','/find-work'],['📝 My Proposals','/my-proposals'],['✍️ AI Proposal','/ai-tools/proposal'],['📊 Earnings','/earnings']],
    client:           [['➕ Post Project','/post-project'],['👥 Find Freelancers','/find-talent'],['📋 My Projects','/my-projects'],['💬 Messages','/messages']],
    student:          [['📚 Browse Courses','/learn'],['🎯 AI Career Coach','/ai-tools/career'],['📝 AI Resume','/ai-tools/resume'],['🎤 Interview Prep','/ai-tools/interview']],
    jobseeker:        [['🔍 Browse Jobs','/jobs'],['📝 AI Resume','/ai-tools/resume'],['🎤 Mock Interview','/ai-tools/interview'],['📊 Skill Analysis','/ai-tools/skills']],
    service_provider: [['➕ Create Gig','/create-service'],['📦 My Services','/my-services'],['📋 Orders','/my-orders'],['⭐ Reviews','/my-reviews']],
    mentor:           [['📖 Create Course','/create-course'],['👥 My Students','/my-students'],['💬 Sessions','/sessions'],['💰 Earnings','/earnings']],
    recruiter:        [['➕ Post Job','/post-job'],['👥 Candidates','/candidates'],['🤖 AI Matching','/ai-tools/match'],['📊 Analytics','/recruiter-analytics']],
    admin:            [['📊 Admin Panel','/admin'],['👥 All Users','/admin/users'],['📦 All Orders','/admin/orders'],['⚙️ Settings','/admin/settings']],
  };

  const links = quickLinks[user.primaryRole] || quickLinks.freelancer;

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>

      {/* TOP NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(7,7,15,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 40px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${gold},#b8860b)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:900, color:'#000', fontSize:14 }}>N</div>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:gold }}>NexWork</span>
        </Link>
        <div style={{ display:'flex', gap:20, alignItems:'center' }}>
          {[['Find Work','/find-work'],['Find Talent','/find-talent'],['Services','/services'],['Jobs','/jobs'],['Learn','/learn']].map(([l,p]) => (
            <Link key={l} to={p} style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:13 }}>{l}</Link>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Link to="/messages" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:13, position:'relative' }}>
            💬 Messages
          </Link>
          <Link to="/notifications" style={{ position:'relative', color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:13 }}>
            🔔 {notifs.filter(n=>!n.isRead).length > 0 && <span style={{ position:'absolute', top:-6, right:-8, background:'#f87171', borderRadius:'50%', width:16, height:16, fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700 }}>{notifs.filter(n=>!n.isRead).length}</span>}
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => navigate('/profile')}>
            {user.photo ? <img src={user.photo} alt="" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover', border:`2px solid ${rc}` }} /> : <div style={{ width:32, height:32, borderRadius:'50%', background:`${rc}25`, border:`2px solid ${rc}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:rc, fontSize:13 }}>{user.name?.[0]?.toUpperCase()}</div>}
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>{user.name?.split(' ')[0]}</span>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{ background:'none', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.3)', borderRadius:7, padding:'6px 12px', fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding:'32px 40px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:24 }}>

          {/* SIDEBAR */}
          <div>
            {/* Profile card */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:20, marginBottom:16, textAlign:'center' }}>
              {user.photo ? <img src={user.photo} alt="" style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover', border:`3px solid ${rc}`, marginBottom:12 }} />
                : <div style={{ width:72, height:72, borderRadius:'50%', background:`${rc}20`, border:`3px solid ${rc}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:700, color:rc, margin:'0 auto 12px' }}>{user.name?.[0]?.toUpperCase()}</div>
              }
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16 }}>{user.name}</div>
              <div style={{ background:`${rc}18`, border:`1px solid ${rc}35`, color:rc, fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:12, display:'inline-block', margin:'6px 0', textTransform:'uppercase', letterSpacing:1 }}>{user.primaryRole}</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, lineHeight:1.5 }}>{user.headline || 'Complete your profile'}</div>
              {user.city && <div style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginTop:6 }}>📍 {user.city}</div>}
              <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:12 }}>
                <div style={{ textAlign:'center' }}><div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:gold }}>{user.rating || 0}</div><div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>Rating</div></div>
                <div style={{ textAlign:'center' }}><div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:gold }}>{user.totalJobs || 0}</div><div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>Jobs</div></div>
                <div style={{ textAlign:'center' }}><div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:gold }}>{(user.skills||[]).length}</div><div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>Skills</div></div>
              </div>
              <Link to="/profile/edit" style={{ display:'block', marginTop:14, background:`${rc}15`, border:`1px solid ${rc}30`, color:rc, textDecoration:'none', padding:'8px', borderRadius:8, fontSize:12, fontWeight:600 }}>✏️ Edit Profile</Link>
            </div>

            {/* Quick links */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:14 }}>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:2, color:'rgba(255,255,255,0.3)', marginBottom:10, fontWeight:600 }}>Quick Links</div>
              {links.map(([label, path]) => (
                <Link key={label} to={path} style={{ display:'block', padding:'9px 12px', borderRadius:8, textDecoration:'none', color:'rgba(255,255,255,0.6)', fontSize:13, transition:'all 0.15s', marginBottom:2 }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div>
            {/* Welcome + AI tip */}
            <div style={{ background:`linear-gradient(135deg,${rc}12,rgba(0,0,0,0))`, border:`1px solid ${rc}25`, borderRadius:14, padding:'22px 24px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
              <div>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, marginBottom:4 }}>Welcome back, {user.name?.split(' ')[0]}! 👋</h1>
                <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14 }}>
                  {user.availability === 'available' ? '✅ You are available for work' : '⛔ You are currently unavailable'}
                  {user.plan !== 'free' && ` · ⭐ ${user.plan} plan`}
                </p>
                {aiTip && <div style={{ marginTop:12, background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.6, maxWidth:500 }}>💡 <strong style={{ color:gold }}>AI Tip:</strong> {aiTip}</div>}
              </div>
              <button onClick={getAITip} disabled={loadingTip} style={{ background:`${gold}18`, border:`1px solid ${gold}35`, color:gold, borderRadius:9, padding:'10px 18px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap', flexShrink:0 }}>
                {loadingTip ? '⏳ Loading...' : '🤖 Get AI Tip'}
              </button>
            </div>

            {/* Skills */}
            {(user.skills||[]).length > 0 && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>Your Skills</h3>
                  <Link to="/profile/edit" style={{ color:'rgba(255,255,255,0.3)', fontSize:12, textDecoration:'none' }}>+ Add more</Link>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                  {user.skills.map(s => (
                    <span key={s.name} style={{ background:s.verified?`${gold}18`:'rgba(255,255,255,0.06)', border:`1px solid ${s.verified?gold:'rgba(255,255,255,0.1)'}`, color:s.verified?gold:'rgba(255,255,255,0.6)', fontSize:12, padding:'5px 12px', borderRadius:20, display:'flex', alignItems:'center', gap:5 }}>
                      {s.name} {s.verified && '✓'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Projects */}
            {projects.length > 0 && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>💼 Open Projects</h3>
                  <Link to="/find-work" style={{ color:gold, fontSize:12, textDecoration:'none', fontWeight:600 }}>View All →</Link>
                </div>
                <div style={{ display:'grid', gap:10 }}>
                  {projects.slice(0,3).map(p => (
                    <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration:'none', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, transition:'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(212,168,83,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:14, color:'#fff', marginBottom:3 }}>{p.title}</div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{p.category} · {p.duration||'Flexible'}</div>
                        <div style={{ display:'flex', gap:5, marginTop:6, flexWrap:'wrap' }}>
                          {(p.skills||[]).slice(0,3).map(s => <span key={s} style={{ background:'rgba(99,102,241,0.1)', color:'#a78bfa', fontSize:10, padding:'2px 7px', borderRadius:8 }}>{s}</span>)}
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        {p.budget && <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:gold }}>₹{p.budget.min}-{p.budget.max}</div>}
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{p.proposals?.length||0} proposals</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Latest Jobs */}
            {jobs.length > 0 && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>🔍 Latest Jobs</h3>
                  <Link to="/jobs" style={{ color:gold, fontSize:12, textDecoration:'none', fontWeight:600 }}>View All →</Link>
                </div>
                <div style={{ display:'grid', gap:8 }}>
                  {jobs.slice(0,3).map(j => (
                    <Link key={j._id} to={`/jobs/${j._id}`} style={{ textDecoration:'none', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(16,185,129,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14, color:'#fff', marginBottom:2 }}>{j.title}</div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{j.company} · {j.mode} · {j.type}</div>
                      </div>
                      {j.salary && <div style={{ fontSize:12, color:'#10b981', fontWeight:600, flexShrink:0 }}>₹{j.salary.min?.toLocaleString()}-{j.salary.max?.toLocaleString()}/mo</div>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* AI Tools */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px' }}>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:14 }}>🤖 AI Tools</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10 }}>
                {[['🎤','Interview Prep','/ai-tools/interview','#e91e8c'],['📝','Resume Builder','/ai-tools/resume','#7c3aed'],['🎯','Career Coach','/ai-tools/career','#00d4ff'],['📊','Skill Analysis','/ai-tools/skills','#10b981'],['✍️','Proposal Writer','/ai-tools/proposal',gold],['🔍','Job Matcher','/ai-tools/match','#6366f1']].map(([icon, label, path, color]) => (
                  <Link key={label} to={path} style={{ textDecoration:'none', background:`${color}10`, border:`1px solid ${color}25`, borderRadius:10, padding:'14px 12px', textAlign:'center', transition:'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background=`${color}20`; e.currentTarget.style.borderColor=color; }}
                    onMouseLeave={e => { e.currentTarget.style.background=`${color}10`; e.currentTarget.style.borderColor=`${color}25`; }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}
