import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage  from './pages/LandingPage';
import Onboarding   from './pages/Onboarding';
import Dashboard    from './pages/Dashboard';
import FindWork     from './pages/FindWork';
import FindTalent   from './pages/FindTalent';
import ServicesPage from './pages/ServicesPage';
import JobsPage     from './pages/JobsPage';
import PostProject  from './pages/PostProject';
import AITools      from './pages/AITools';
import ProfileEdit  from './pages/ProfileEdit';
import Messages     from './pages/Messages';
import CreateService   from './pages/CreateService';
import PostJob         from './pages/PostJob';
import AdminDashboard  from './pages/AdminDashboard';
import MyOrders        from './pages/MyOrders';
import MyProjects      from './pages/MyProjects';
import Earnings        from './pages/Earnings';
import Notifications   from './pages/Notifications';
import ProjectDetail   from './pages/ProjectDetail';
import TalentProfile   from './pages/TalentProfile';

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
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#07070f', color:'#d4a853', fontSize:18, fontFamily:'Syne,sans-serif', fontWeight:700, gap:12 }}>
    <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#d4a853,#b8860b)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#000', fontSize:14 }}>N</div>
    Loading NexWork...
  </div>
);

const ComingSoon = ({ title, icon='🚧' }) => (
  <div style={{ minHeight:'100vh', background:'#07070f', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:80 }}>
    <div style={{ fontSize:52 }}>{icon}</div>
    <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24 }}>{title}</h2>
    <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Coming very soon!</p>
    <a href="/dashboard" style={{ background:'linear-gradient(135deg,#d4a853,#b8860b)', color:'#000', padding:'11px 24px', borderRadius:9, textDecoration:'none', fontWeight:700, fontSize:14 }}>← Dashboard</a>
  </div>
);

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
            <div style={{ width:38, height:38, borderRadius:10, background:`linear-gradient(135deg,${gold},#b8860b)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:900, color:'#000', fontSize:17 }}>N</div>
            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:gold }}>NexWork</span>
          </a>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:'#fff', marginTop:20, marginBottom:4 }}>Welcome Back 👋</h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>Sign in to your NexWork account</p>
        </div>
        {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', color:'#f87171', fontSize:13, marginBottom:16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[['Email','email','email'],['Password','password','password']].map(([label,key,type]) => (
            <div key={key} style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:5 }}>{label}</label>
              <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, padding:'12px 13px', color:'#fff', fontSize:14, outline:'none', fontFamily:'DM Sans,sans-serif' }} onFocus={e=>e.target.style.borderColor=gold} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width:'100%', background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', border:'none', borderRadius:9, padding:13, fontWeight:800, fontSize:15, cursor:loading?'not-allowed':'pointer', fontFamily:'Syne,sans-serif', marginTop:4, opacity:loading?0.7:1 }}>
            {loading ? '⏳ Signing in...' : '→ Sign In'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:18, fontSize:14, color:'rgba(255,255,255,0.4)' }}>
          No account? <a href="/onboarding" style={{ color:gold, fontWeight:600, textDecoration:'none' }}>Create one free →</a>
        </p>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800;900&family=DM+Sans&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC */}
          <Route path="/"             element={<LandingPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/onboarding"   element={<Onboarding />} />

          {/* PROTECTED */}
          <Route path="/dashboard"    element={<Protected><Dashboard /></Protected>} />
          <Route path="/find-work"    element={<Protected><FindWork /></Protected>} />
          <Route path="/find-talent"  element={<Protected><FindTalent /></Protected>} />
          <Route path="/services"     element={<Protected><ServicesPage /></Protected>} />
          <Route path="/jobs"         element={<Protected><JobsPage /></Protected>} />
          <Route path="/post-project" element={<Protected><PostProject /></Protected>} />
          <Route path="/profile/edit" element={<Protected><ProfileEdit /></Protected>} />

          {/* AI Tools */}
          <Route path="/ai-tools"           element={<Protected><AITools /></Protected>} />
          <Route path="/ai-tools/:tool"     element={<Protected><AITools /></Protected>} />

          {/* Coming soon */}
          <Route path="/messages"       element={<Protected><Messages /></Protected>} />
          <Route path="/my-projects"    element={<Protected><MyProjects /></Protected>} />
          <Route path="/my-services"    element={<Protected><ComingSoon title="My Services ⚙️" icon="⚙️" /></Protected>} />
          <Route path="/my-orders"      element={<Protected><MyOrders /></Protected>} />
          <Route path="/profile"        element={<Protected><ComingSoon title="My Profile 👤" icon="👤" /></Protected>} />
          <Route path="/earnings"       element={<Protected><Earnings /></Protected>} />
          <Route path="/post-job"       element={<Protected><PostJob /></Protected>} />
          <Route path="/create-service" element={<Protected><CreateService /></Protected>} />
          <Route path="/learn"          element={<Protected><ComingSoon title="Learning Hub 📚" icon="📚" /></Protected>} />
          <Route path="/notifications"  element={<Protected><Notifications /></Protected>} />
          <Route path="/projects/:id"   element={<ProjectDetail />} />
          <Route path="/talent/:id"     element={<TalentProfile />} />
          <Route path="/candidates"     element={<Protected><ComingSoon title="Candidates 👥" icon="👥" /></Protected>} />

          {/* Admin */}
          <Route path="/admin"          element={<AdminOnly><AdminDashboard /></AdminOnly>} />

          <Route path="*"               element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
