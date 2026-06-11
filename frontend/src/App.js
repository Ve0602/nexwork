import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage  from './pages/LandingPage';
import Onboarding   from './pages/Onboarding';
import Dashboard    from './pages/Dashboard';

// Protected route
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" />;
  if (!user.roles?.includes('admin')) return <Navigate to="/dashboard" />;
  return children;
}

const Loader = () => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#07070f', color:'#d4a853', fontSize:18, fontFamily:'Syne,sans-serif', fontWeight:700 }}>
    Loading NexWork...
  </div>
);

// Placeholder pages (to be built next)
const ComingSoon = ({ title }) => (
  <div style={{ minHeight:'100vh', background:'#07070f', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:80 }}>
    <div style={{ fontSize:48 }}>🚧</div>
    <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24 }}>{title}</h2>
    <p style={{ color:'rgba(255,255,255,0.4)' }}>This page is being built. Check back soon!</p>
    <a href="/dashboard" style={{ background:'#d4a853', color:'#000', padding:'11px 24px', borderRadius:9, textDecoration:'none', fontWeight:700, fontSize:14 }}>← Back to Dashboard</a>
  </div>
);

// Login page (simple version)
function LoginPage() {
  const { login, user } = useAuth();
  const [form, setForm] = React.useState({ email:'', password:'' });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => { if (user) navigate('/dashboard'); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const u = await login(form.email, form.password);
      navigate(u.roles?.includes('admin') ? '/admin' : '/dashboard');
    } catch (e) { setError(e.response?.data?.message || 'Invalid email or password'); }
    finally { setLoading(false); }
  };

  const gold = '#d4a853';
  return (
    <div style={{ minHeight:'100vh', background:'#07070f', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:420, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:36 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <a href="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${gold},#b8860b)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:900, color:'#000', fontSize:16 }}>N</div>
            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:gold }}>NexWork</span>
          </a>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:'#fff', marginTop:20, marginBottom:4 }}>Welcome Back 👋</h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Sign in to your account</p>
        </div>
        {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', color:'#f87171', fontSize:13, marginBottom:16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[['Email','email','email'],['Password','password','password']].map(([label,key,type]) => (
            <div key={key} style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:5 }}>{label}</label>
              <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, padding:'12px 13px', color:'#fff', fontSize:14, outline:'none', fontFamily:'DM Sans,sans-serif' }} onFocus={e=>e.target.style.borderColor=gold} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width:'100%', background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:9, padding:13, fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'Syne,sans-serif', marginTop:4, opacity:loading?0.7:1 }}>
            {loading ? 'Signing in...' : '→ Sign In'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:18, fontSize:14, color:'rgba(255,255,255,0.4)' }}>
          No account? <a href="/onboarding" style={{ color:gold, fontWeight:600 }}>Create one free</a>
        </p>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800;900&family=DM+Sans&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"            element={<LandingPage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/onboarding"  element={<Onboarding />} />

          {/* Protected */}
          <Route path="/dashboard"   element={<Protected><Dashboard /></Protected>} />
          <Route path="/find-work"   element={<Protected><ComingSoon title="Find Work 💼" /></Protected>} />
          <Route path="/find-talent" element={<Protected><ComingSoon title="Find Talent 👥" /></Protected>} />
          <Route path="/services"    element={<Protected><ComingSoon title="Services 🛍️" /></Protected>} />
          <Route path="/jobs"        element={<Protected><ComingSoon title="Jobs 🔍" /></Protected>} />
          <Route path="/learn"       element={<Protected><ComingSoon title="Learning Hub 📚" /></Protected>} />
          <Route path="/messages"    element={<Protected><ComingSoon title="Messages 💬" /></Protected>} />
          <Route path="/my-projects" element={<Protected><ComingSoon title="My Projects 📋" /></Protected>} />
          <Route path="/my-services" element={<Protected><ComingSoon title="My Services ⚙️" /></Protected>} />
          <Route path="/my-orders"   element={<Protected><ComingSoon title="My Orders 📦" /></Protected>} />
          <Route path="/profile"     element={<Protected><ComingSoon title="My Profile 👤" /></Protected>} />
          <Route path="/profile/edit" element={<Protected><ComingSoon title="Edit Profile ✏️" /></Protected>} />
          <Route path="/earnings"    element={<Protected><ComingSoon title="Earnings 💰" /></Protected>} />
          <Route path="/post-project" element={<Protected><ComingSoon title="Post a Project ➕" /></Protected>} />
          <Route path="/post-job"    element={<Protected><ComingSoon title="Post a Job ➕" /></Protected>} />
          <Route path="/create-service" element={<Protected><ComingSoon title="Create a Gig ➕" /></Protected>} />

          {/* AI Tools */}
          <Route path="/ai-tools/career"   element={<Protected><ComingSoon title="AI Career Coach 🎯" /></Protected>} />
          <Route path="/ai-tools/resume"   element={<Protected><ComingSoon title="AI Resume Builder 📝" /></Protected>} />
          <Route path="/ai-tools/interview" element={<Protected><ComingSoon title="AI Interview Coach 🎤" /></Protected>} />
          <Route path="/ai-tools/skills"   element={<Protected><ComingSoon title="AI Skill Analyzer 📊" /></Protected>} />
          <Route path="/ai-tools/proposal" element={<Protected><ComingSoon title="AI Proposal Writer ✍️" /></Protected>} />
          <Route path="/ai-tools/match"    element={<Protected><ComingSoon title="AI Job Matcher 🔍" /></Protected>} />

          {/* Admin */}
          <Route path="/admin"       element={<AdminOnly><ComingSoon title="Admin Dashboard ⚙️" /></AdminOnly>} />

          <Route path="*"            element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
