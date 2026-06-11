import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id:'freelancer',      icon:'💼', title:'Freelancer',       desc:'Offer your skills and get hired for projects', color:'#d4a853' },
  { id:'client',          icon:'🚀', title:'Client / Employer', desc:'Post projects and hire talented professionals', color:'#7c3aed' },
  { id:'student',         icon:'📚', title:'Student',          desc:'Learn new skills and find internships', color:'#00d4ff' },
  { id:'jobseeker',       icon:'🔍', title:'Job Seeker',       desc:'Find full-time and part-time jobs', color:'#10b981' },
  { id:'service_provider',icon:'🧵', title:'Service Provider', desc:'Offer local services like tailoring, photography, etc.', color:'#e91e8c' },
  { id:'mentor',          icon:'🎓', title:'Mentor / Trainer', desc:'Teach, mentor and share your expertise', color:'#f59e0b' },
  { id:'recruiter',       icon:'🏢', title:'Recruiter',        desc:'Find and hire talent for your company', color:'#6366f1' },
  { id:'professional',    icon:'⭐', title:'Professional',     desc:'Build your professional brand and network', color:'#14b8a6' },
];

const SKILL_SUGGESTIONS = {
  freelancer:       ['Python','JavaScript','React','Node.js','AI/ML','Prompt Engineering','Data Annotation','Graphic Design','Content Writing'],
  client:           ['Project Management','Team Leadership','Product Design','Business Strategy'],
  student:          ['Python','Java','HTML/CSS','Machine Learning','Data Analysis','React'],
  jobseeker:        ['Communication','Problem Solving','Python','JavaScript','Data Analysis','Excel'],
  service_provider: ['Tailoring','Embroidery','Photography','Home Repair','Cooking','Beauty Services'],
  mentor:           ['Teaching','Communication','Python','Leadership','Career Coaching','Interview Prep'],
  recruiter:        ['HR Management','Talent Acquisition','LinkedIn','ATS Tools','Communication'],
  professional:     ['Leadership','Strategy','Communication','Project Management','Networking'],
};

export default function Onboarding() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultRole = params.get('role') || '';

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    primaryRole: defaultRole,
    city: '', state: '', country: 'India',
    skills: [],
    headline: '',
    language: 'en',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => { if (user) navigate('/dashboard'); }, [user]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addSkill = (skill) => {
    if (!skill.trim()) return;
    if (!form.skills.includes(skill.trim())) {
      f('skills', [...form.skills, skill.trim()]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => f('skills', form.skills.filter(s => s !== skill));

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const user = await register(form);
      navigate('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const canNext = () => {
    if (step === 1) return form.primaryRole !== '';
    if (step === 2) return form.name && form.email && form.password && form.password.length >= 6;
    if (step === 3) return form.city !== '';
    return true;
  };

  const gold = '#d4a853';
  const steps = ['Choose Role', 'Account', 'Location', 'Skills & Bio'];

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: 'DM Sans,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>

      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${gold},#b8860b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 900, color: '#000', fontSize: 16 }}>N</div>
        <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: gold }}>NexWork</span>
      </Link>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: step > i+1 ? gold : step === i+1 ? `linear-gradient(135deg,${gold},#b8860b)` : 'rgba(255,255,255,0.08)', border: `2px solid ${step >= i+1 ? gold : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: step >= i+1 ? '#000' : 'rgba(255,255,255,0.3)', fontFamily: 'Syne,sans-serif' }}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <div style={{ fontSize: 10, color: step === i+1 ? gold : 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{s}</div>
            </div>
            {i < steps.length-1 && <div style={{ width: 60, height: 2, background: step > i+1 ? gold : 'rgba(255,255,255,0.08)', margin: '0 6px 14px' }} />}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div style={{ width: '100%', maxWidth: step === 1 ? 720 : 480, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px' }}>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 20 }}>{error}</div>}

        {/* STEP 1 — Choose Role */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>What brings you to NexWork?</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24 }}>Choose your primary role — you can add more later</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
              {ROLES.map(role => (
                <div key={role.id} onClick={() => f('primaryRole', role.id)}
                  style={{ background: form.primaryRole === role.id ? `${role.color}18` : 'rgba(255,255,255,0.03)', border: `2px solid ${form.primaryRole === role.id ? role.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '18px 16px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (form.primaryRole !== role.id) e.currentTarget.style.borderColor = `${role.color}50`; }}
                  onMouseLeave={e => { if (form.primaryRole !== role.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{role.icon}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: form.primaryRole === role.id ? role.color : '#fff', marginBottom: 4 }}>{role.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5 }}>{role.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Account */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Create your account</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24 }}>You're signing up as: <strong style={{ color: gold }}>{ROLES.find(r => r.id === form.primaryRole)?.title}</strong></p>
            <div style={{ display: 'grid', gap: 14 }}>
              <FI label="Full Name *" value={form.name} onChange={v => f('name', v)} placeholder="Ramana Vemunoori" />
              <FI label="Email Address *" value={form.email} onChange={v => f('email', v)} type="email" placeholder="you@email.com" />
              <FI label="Phone Number" value={form.phone} onChange={v => f('phone', v)} placeholder="+91 99999 99999" />
              <FI label="Password * (min 6 characters)" value={form.password} onChange={v => f('password', v)} type="password" placeholder="Create a strong password" />
              <div>
                <label style={ls}>Preferred Language</label>
                <select value={form.language} onChange={e => f('language', e.target.value)} style={is}>
                  <option value="en">English</option>
                  <option value="te">Telugu</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 14 }}>Already have an account? <Link to="/login" style={{ color: gold }}>Sign in</Link></p>
          </div>
        )}

        {/* STEP 3 — Location */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Where are you based?</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24 }}>This helps match you with local opportunities</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FI label="City *" value={form.city} onChange={v => f('city', v)} placeholder="Warangal" />
              <FI label="State" value={form.state} onChange={v => f('state', v)} placeholder="Telangana" />
              <div>
                <label style={ls}>Country</label>
                <select value={form.country} onChange={e => f('country', e.target.value)} style={is}>
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Skills & Bio */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Almost done!</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24 }}>Add your skills and a headline to stand out</p>
            <div style={{ display: 'grid', gap: 14 }}>
              <FI label="Professional Headline" value={form.headline} onChange={v => f('headline', v)} placeholder="e.g. AI Prompt Engineer | Data Annotation Expert" />
              <div>
                <label style={ls}>Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {form.skills.map(s => (
                    <span key={s} style={{ background: `${gold}18`, border: `1px solid ${gold}35`, color: gold, fontSize: 12, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                      {s} <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))} placeholder="Type a skill and press Enter" style={{ ...is, flex: 1 }} />
                  <button onClick={() => addSkill(skillInput)} style={{ background: gold, color: '#000', border: 'none', borderRadius: 8, padding: '0 16px', fontWeight: 700, cursor: 'pointer' }}>Add</button>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Suggestions:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {(SKILL_SUGGESTIONS[form.primaryRole] || []).filter(s => !form.skills.includes(s)).slice(0, 6).map(s => (
                      <button key={s} onClick={() => addSkill(s)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 11, padding: '4px 10px', borderRadius: 14, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>+ {s}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <div>{step > 1 && <button onClick={() => setStep(s => s-1)} style={btnOut}>← Back</button>}</div>
          <div>
            {step < 4
              ? <button onClick={() => canNext() && setStep(s => s+1)} style={{ ...btnGold, opacity: canNext() ? 1 : 0.4, cursor: canNext() ? 'pointer' : 'not-allowed' }}>Continue →</button>
              : <button onClick={handleSubmit} disabled={loading} style={{ ...btnGold, opacity: loading ? 0.7 : 1 }}>{loading ? '⏳ Creating...' : '🚀 Create Account'}</button>
            }
          </div>
        </div>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 20 }}>By creating an account you agree to our Terms of Service and Privacy Policy</p>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

const FI = ({ label, value, onChange, type = 'text', placeholder, span }) => (
  <div style={span === 2 ? { gridColumn: '1/-1' } : {}}>
    <label style={ls}>{label}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={is} />
  </div>
);

const ls = { display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 5 };
const is = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '11px 13px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif' };
const btnGold = { background: 'linear-gradient(135deg,#d4a853,#b8860b)', color: '#000', border: 'none', borderRadius: 9, padding: '12px 26px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' };
const btnOut  = { background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '12px 24px', fontWeight: 500, fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' };
