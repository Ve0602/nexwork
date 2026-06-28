import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/theme.css';

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
import VerifyEmail     from './pages/VerifyEmail';
import Terms           from './pages/Terms';
import Privacy         from './pages/Privacy';

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
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', color:'var(--text-muted)', fontSize:13 }}>
    Loading…
  </div>
);

const ComingSoon = ({ title }) => (
  <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14 }}>
    <h2 style={{ fontSize:18, fontWeight:600 }}>{title}</h2>
    <p style={{ color:'var(--text-muted)', fontSize:13 }}>Coming soon.</p>
    <a href="/dashboard" className="btn btn-secondary">← Dashboard</a>
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

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="card" style={{ width:'100%', maxWidth:380, padding:32 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <a href="/" className="mono" style={{ fontWeight:600, fontSize:15, color:'var(--text)' }}>NexWork</a>
          <h2 style={{ fontSize:18, fontWeight:600, marginTop:18, marginBottom:4 }}>Welcome back</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Sign in to your account</p>
        </div>
        {error && <div className="card" style={{ padding:'10px 14px', marginBottom:16, fontSize:13, color:'var(--danger)' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[['Email','email','email'],['Password','password','password']].map(([label,key,type]) => (
            <div key={key} style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:5 }}>{label}</label>
              <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required className="input" />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', marginTop:4 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--text-muted)' }}>
          No account? <a href="/onboarding" style={{ color:'var(--accent)', fontWeight:500 }}>Create one free →</a>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
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
          <Route path="/verify-email"   element={<VerifyEmail />} />
          <Route path="/terms"          element={<Terms />} />
          <Route path="/privacy"        element={<Privacy />} />
          <Route path="/candidates"     element={<Protected><ComingSoon title="Candidates 👥" icon="👥" /></Protected>} />

          {/* Admin */}
          <Route path="/admin"          element={<AdminOnly><AdminDashboard /></AdminOnly>} />

          <Route path="*"               element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}
