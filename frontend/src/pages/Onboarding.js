import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id:'freelancer',      title:'Freelancer',        desc:'Offer your skills and get hired for projects' },
  { id:'client',          title:'Client / employer',  desc:'Post projects and hire talented professionals' },
  { id:'student',         title:'Student',            desc:'Learn new skills and find internships' },
  { id:'jobseeker',       title:'Job seeker',         desc:'Find full-time and part-time jobs' },
  { id:'service_provider',title:'Service provider',   desc:'Offer local services like tailoring, photography' },
  { id:'mentor',          title:'Mentor / trainer',   desc:'Teach, mentor and share your expertise' },
  { id:'recruiter',       title:'Recruiter',          desc:'Find and hire talent for your company' },
  { id:'professional',    title:'Professional',       desc:'Build your professional brand and network' },
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
    if (!form.skills.includes(skill.trim())) f('skills', [...form.skills, skill.trim()]);
    setSkillInput('');
  };
  const removeSkill = (skill) => f('skills', form.skills.filter(s => s !== skill));

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try { await register(form); navigate('/dashboard'); }
    catch (e) { setError(e.response?.data?.message || 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const canNext = () => {
    if (step === 1) return form.primaryRole !== '';
    if (step === 2) return form.name && form.email && form.password && form.password.length >= 6;
    if (step === 3) return form.city !== '';
    return true;
  };

  const steps = ['Choose role', 'Account', 'Location', 'Skills'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>

      <Link to="/" className="mono" style={{ fontWeight: 600, fontSize: 16, marginBottom: 28 }}>NexWork</Link>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div className="mono" style={{ width: 26, height: 26, borderRadius: '50%', background: step >= i+1 ? 'var(--accent)' : 'var(--bg-subtle)', border: `1px solid ${step >= i+1 ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: step >= i+1 ? '#fff' : 'var(--text-faint)' }}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <div style={{ fontSize: 10, color: step === i+1 ? 'var(--accent)' : 'var(--text-faint)', whiteSpace: 'nowrap' }}>{s}</div>
            </div>
            {i < steps.length-1 && <div style={{ width: 50, height: 1, background: step > i+1 ? 'var(--accent)' : 'var(--border)', margin: '0 4px 14px' }} />}
          </div>
        ))}
      </div>

      <div className="card" style={{ width: '100%', maxWidth: step === 1 ? 680 : 440, padding: 28 }}>

        {error && <div className="card" style={{ padding: '10px 14px', marginBottom: 18, fontSize: 13, color: 'var(--danger)' }}>{error}</div>}

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>What brings you to NexWork?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Choose your primary role — you can add more later</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 10 }}>
              {ROLES.map(role => (
                <div key={role.id} onClick={() => f('primaryRole', role.id)} className="card" style={{ padding: '14px 16px', cursor: 'pointer', borderColor: form.primaryRole === role.id ? 'var(--accent)' : 'var(--border)', background: form.primaryRole === role.id ? 'var(--accent-subtle)' : 'var(--bg-raised)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: form.primaryRole === role.id ? 'var(--accent)' : 'var(--text)', marginBottom: 4 }}>{role.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5 }}>{role.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Create your account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Signing up as: <strong style={{ color: 'var(--accent)' }}>{ROLES.find(r => r.id === form.primaryRole)?.title}</strong></p>
            <div style={{ display: 'grid', gap: 14 }}>
              <FI label="Full name" value={form.name} onChange={v => f('name', v)} />
              <FI label="Email address" value={form.email} onChange={v => f('email', v)} type="email" />
              <FI label="Phone number" value={form.phone} onChange={v => f('phone', v)} />
              <FI label="Password (min 6 characters)" value={form.password} onChange={v => f('password', v)} type="password" />
              <div>
                <label style={ls}>Preferred language</label>
                <select value={form.language} onChange={e => f('language', e.target.value)} className="input">
                  <option value="en">English</option><option value="te">Telugu</option><option value="hi">Hindi</option>
                </select>
              </div>
            </div>
            <p style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: 14 }}>Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link></p>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Where are you based?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>This helps match you with local opportunities</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FI label="City" value={form.city} onChange={v => f('city', v)} />
              <FI label="State" value={form.state} onChange={v => f('state', v)} />
              <div><label style={ls}>Country</label><select value={form.country} onChange={e => f('country', e.target.value)} className="input"><option>India</option><option>United States</option><option>United Kingdom</option><option>Other</option></select></div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Almost done</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Add skills and a headline to stand out</p>
            <div style={{ display: 'grid', gap: 14 }}>
              <FI label="Professional headline" value={form.headline} onChange={v => f('headline', v)} placeholder="e.g. AI Prompt Engineer | Data Annotation Expert" />
              <div>
                <label style={ls}>Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {form.skills.map(s => (
                    <span key={s} className="tag tag-accent" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {s} <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))} placeholder="Type a skill and press Enter" className="input" />
                  <button onClick={() => addSkill(skillInput)} className="btn btn-secondary">Add</button>
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {(SKILL_SUGGESTIONS[form.primaryRole] || []).filter(s => !form.skills.includes(s)).slice(0, 6).map(s => (
                    <button key={s} onClick={() => addSkill(s)} className="tag" style={{ cursor: 'pointer' }}>+ {s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <div>{step > 1 && <button onClick={() => setStep(s => s-1)} className="btn btn-secondary">← Back</button>}</div>
          <div>
            {step < 4
              ? <button onClick={() => canNext() && setStep(s => s+1)} disabled={!canNext()} className="btn btn-primary" style={{ opacity: canNext() ? 1 : 0.4 }}>Continue →</button>
              : <button onClick={handleSubmit} disabled={loading} className="btn btn-primary">{loading ? 'Creating…' : 'Create account'}</button>
            }
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-faint)', fontSize: 11, marginTop: 18 }}>By creating an account you agree to our Terms of Service and Privacy Policy</p>
    </div>
  );
}

const FI = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div><label style={ls}>{label}</label><input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input" /></div>
);
const ls = { display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' };
