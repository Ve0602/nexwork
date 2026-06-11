import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STATS = [
  { num: '10K+', label: 'Freelancers' },
  { num: '5K+',  label: 'Projects Posted' },
  { num: '₹2Cr+',label: 'Paid Out' },
  { num: '500+', label: 'Companies Hiring' },
];

const CATEGORIES = [
  { icon: '🤖', title: 'AI & Machine Learning', count: '120+', color: '#00d4ff' },
  { icon: '💻', title: 'Web Development',       count: '340+', color: '#7c3aed' },
  { icon: '🎨', title: 'Design & Creative',     count: '210+', color: '#e91e8c' },
  { icon: '🧵', title: 'Tailoring & Fashion',   count: '80+',  color: '#d4a853' },
  { icon: '📊', title: 'Data Science',          count: '160+', color: '#10b981' },
  { icon: '📚', title: 'Learning & Teaching',   count: '90+',  color: '#f59e0b' },
  { icon: '🏠', title: 'Home Services',         count: '70+',  color: '#6366f1' },
  { icon: '📷', title: 'Photography',           count: '50+',  color: '#14b8a6' },
];

const HOW_IT_WORKS = [
  { icon: '👤', step: '01', title: 'Create Profile', desc: 'Sign up and build your AI-powered profile in minutes. Add skills, portfolio and set your rate.' },
  { icon: '🔍', step: '02', title: 'Find Work or Hire', desc: 'Browse thousands of projects and gigs, or post your project to find the perfect freelancer.' },
  { icon: '💬', step: '03', title: 'Collaborate', desc: 'Use built-in messaging, video calls, and project management tools to work seamlessly.' },
  { icon: '💰', step: '04', title: 'Get Paid Safely', desc: 'Secure escrow payments protect both parties. Get paid when work is approved.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(STATS);
  const [activeCat, setActiveCat] = useState('all');
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user]);

  const gold = '#d4a853';

  return (
    <div style={{ background: '#07070f', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#fff', overflowX: 'hidden' }}>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,7,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 60px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${gold},#b8860b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 900, color: '#000', fontSize: 16 }}>N</div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, color: gold }}>NexWork</span>
        </Link>

        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {[['Find Talent', '/find-talent'], ['Find Work', '/find-work'], ['Services', '/services'], ['Jobs', '/jobs'], ['Learn', '/learn']].map(([label, path]) => (
            <Link key={label} to={path} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>{label}</Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }}>Sign In</Link>
          <Link to="/onboarding" style={{ background: `linear-gradient(135deg,${gold},#b8860b)`, color: '#000', textDecoration: 'none', fontSize: 14, fontWeight: 700, padding: '9px 20px', borderRadius: 8, fontFamily: 'Syne,sans-serif' }}>Get Started Free</Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Animated background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', borderRadius: '50%', background: `radial-gradient(circle, ${[gold,'#7c3aed','#00d4ff','#e91e8c','#10b981'][i]}15, transparent 70%)`, width: `${300 + i * 100}px`, height: `${300 + i * 100}px`, top: `${[20, 60, 10, 70, 40][i]}%`, left: `${[10, 80, 50, 20, 70][i]}%`, transform: 'translate(-50%,-50%)', animation: `pulse ${4 + i}s ease-in-out infinite alternate` }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${gold}18`, border: `1px solid ${gold}35`, borderRadius: 30, padding: '7px 18px', fontSize: 12, color: gold, marginBottom: 24, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
            🚀 India's #1 AI-Powered Work Platform
          </div>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,6vw,72px)', lineHeight: 1.05, marginBottom: 20 }}>
            Find Work. Hire Talent.<br />
            <span style={{ background: `linear-gradient(135deg,${gold},#e91e8c,#7c3aed)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grow Together.</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(15px,2vw,20px)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 36px' }}>
            The complete platform combining freelancing, local services, AI hiring, learning, and career growth — all in one place. Built for India. Ready for the world.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            <Link to="/onboarding" style={{ background: `linear-gradient(135deg,${gold},#b8860b)`, color: '#000', textDecoration: 'none', padding: '15px 36px', borderRadius: 10, fontWeight: 800, fontSize: 16, fontFamily: 'Syne,sans-serif' }}>
              🚀 Start for Free
            </Link>
            <Link to="/find-work" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', padding: '15px 36px', borderRadius: 10, fontWeight: 600, fontSize: 16 }}>
              Browse Jobs & Gigs →
            </Link>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No credit card required · Free forever for basic use</p>
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────── */}
      <div style={{ padding: '0 60px 80px', display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
        {STATS.map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 36, color: gold }}>{s.num}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── CATEGORIES ─────────────────────────────────────── */}
      <div style={{ padding: '0 60px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 3, color: gold, fontWeight: 700, marginBottom: 10 }}>Browse Categories</div>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(24px,4vw,40px)' }}>Everything you need,<br />in one platform</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.title} to={`/find-work?category=${cat.title}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${cat.color}20`, borderRadius: 14, padding: '24px 20px', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.background = `${cat.color}10`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${cat.color}20`; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{cat.icon}</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>{cat.title}</div>
                <div style={{ color: cat.color, fontSize: 12, fontWeight: 600 }}>{cat.count} services</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <div style={{ padding: '60px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 3, color: gold, fontWeight: 700, marginBottom: 10 }}>How It Works</div>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(24px,4vw,40px)' }}>Start in 4 simple steps</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg,${gold}30,${gold}10)`, border: `2px solid ${gold}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>{step.icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 11, color: gold, letterSpacing: 2, marginBottom: 8 }}>STEP {step.step}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 10 }}>{step.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI FEATURES ────────────────────────────────────── */}
      <div style={{ padding: '80px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 3, color: '#00d4ff', fontWeight: 700, marginBottom: 10 }}>AI-Powered</div>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(24px,4vw,40px)' }}>Supercharged with AI</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, marginTop: 12 }}>Every feature powered by AI to help you work smarter and earn more</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {[
            { icon: '🤖', title: 'AI Career Coach', desc: 'Get personalized career advice, skill gap analysis, and growth roadmaps powered by Claude AI.', color: '#00d4ff' },
            { icon: '📝', title: 'AI Resume Builder', desc: 'Generate ATS-optimized resumes tailored to specific job roles in seconds.', color: '#7c3aed' },
            { icon: '🎤', title: 'AI Interview Coach', desc: 'Practice HR, technical and managerial interviews with real-time AI feedback and scoring.', color: '#e91e8c' },
            { icon: '🎯', title: 'AI Talent Matching', desc: 'Smart matching connects freelancers to projects with 95%+ compatibility score.', color: '#10b981' },
            { icon: '✍️', title: 'AI Proposal Writer', desc: 'Auto-generate winning proposals for any project with one click.', color: '#f59e0b' },
            { icon: '📊', title: 'AI Skill Analyzer', desc: 'Analyze your skills, find gaps, and get a personalized learning roadmap.', color: '#d4a853' },
          ].map(f => (
            <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${f.color}20`, borderRadius: 14, padding: '24px', position: 'relative', overflow: 'hidden', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${f.color}20`; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${f.color},transparent)` }} />
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ────────────────────────────────────────────── */}
      <div style={{ margin: '0 60px 80px', background: `linear-gradient(135deg,${gold}15,#7c3aed15)`, border: `1px solid ${gold}25`, borderRadius: 20, padding: '60px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 'clamp(26px,4vw,48px)', marginBottom: 16 }}>Ready to start earning?</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 28 }}>Join thousands of freelancers and clients already on NexWork</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <Link to="/onboarding?role=freelancer" style={{ background: `linear-gradient(135deg,${gold},#b8860b)`, color: '#000', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontWeight: 800, fontSize: 15, fontFamily: 'Syne,sans-serif' }}>💼 I'm a Freelancer</Link>
          <Link to="/onboarding?role=client" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 15 }}>🚀 I'm Hiring</Link>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Free to join · No hidden fees · Pay only on successful projects</p>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${gold},#b8860b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 900, color: '#000', fontSize: 14 }}>N</div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, color: gold }}>NexWork</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© 2026 NexWork · Built with ❤️ in Warangal, India</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'none' }}>{l}</a>)}
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes pulse { from { opacity: 0.3; transform: translate(-50%,-50%) scale(1); } to { opacity: 0.6; transform: translate(-50%,-50%) scale(1.1); } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #07070f; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>
    </div>
  );
}
