import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TOOLS = [
  { id:'career',    icon:'🎯', title:'AI Career Coach',     desc:'Get personalized career advice and growth roadmap',       color:'#00d4ff' },
  { id:'resume',    icon:'📝', title:'AI Resume Builder',   desc:'Generate ATS-optimized resume for any role',              color:'#7c3aed' },
  { id:'interview', icon:'🎤', title:'AI Interview Coach',  desc:'Practice interviews with real-time AI feedback',           color:'#e91e8c' },
  { id:'skills',    icon:'📊', title:'AI Skill Analyzer',   desc:'Analyze skill gaps and get learning roadmap',             color:'#10b981' },
  { id:'proposal',  icon:'✍️', title:'AI Proposal Writer',  desc:'Write winning proposals for any project instantly',       color:'#f59e0b' },
  { id:'match',     icon:'🔍', title:'AI Job Matcher',      desc:'Find best matching projects for your skills',             color:'#d4a853' },
];

export default function AITools() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState('career');
  const tool = TOOLS.find(t => t.id === activeTool);

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>
      <div style={{ padding:'40px 60px' }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:12, textTransform:'uppercase', letterSpacing:3, color:'#00d4ff', fontWeight:700, marginBottom:8 }}>Powered by Claude AI</div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:'clamp(24px,4vw,40px)', marginBottom:6 }}>🤖 AI Tools</h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15 }}>Supercharge your career and freelancing with AI</p>
        </div>

        {/* Tool selector */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:32 }}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setActiveTool(t.id)} style={{ background: activeTool===t.id ? `${t.color}20` : 'rgba(255,255,255,0.03)', border:`2px solid ${activeTool===t.id ? t.color : 'rgba(255,255,255,0.07)'}`, borderRadius:12, padding:'16px 14px', cursor:'pointer', textAlign:'left', transition:'all 0.2s', fontFamily:'DM Sans,sans-serif' }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{t.icon}</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color: activeTool===t.id ? t.color : '#fff', marginBottom:4 }}>{t.title}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.4 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Active tool */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${tool.color}25`, borderRadius:16, padding:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <span style={{ fontSize:32 }}>{tool.icon}</span>
            <div>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:tool.color }}>{tool.title}</h2>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>{tool.desc}</p>
            </div>
          </div>

          {activeTool === 'career'    && <CareerCoach    token={token} user={user} API={API} color={tool.color} />}
          {activeTool === 'resume'    && <ResumeBuilder   token={token} user={user} API={API} color={tool.color} />}
          {activeTool === 'interview' && <InterviewCoach  token={token} user={user} API={API} color={tool.color} />}
          {activeTool === 'skills'    && <SkillAnalyzer   token={token} user={user} API={API} color={tool.color} />}
          {activeTool === 'proposal'  && <ProposalWriter  token={token} user={user} API={API} color={tool.color} />}
          {activeTool === 'match'     && <JobMatcher      token={token} user={user} API={API} color={tool.color} />}
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}

// ── CAREER COACH ─────────────────────────────────────────────
function CareerCoach({ token, user, API, color }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer]     = useState('');
  const [loading, setLoading]   = useState(false);

  const QUICK = ['How do I grow as a freelancer?','What skills should I learn next?','How do I get my first client?','How to increase my hourly rate?','What certifications are valuable?'];

  const ask = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    setLoading(true); setAnswer('');
    try {
      const { data } = await axios.post(`${API}/api/ai/career-coach`, { question: query, userProfile: user }, { headers: { Authorization: `Bearer ${token}` } });
      setAnswer(data.answer);
    } catch (e) { setAnswer('AI service is temporarily unavailable. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
        {QUICK.map(q => <button key={q} onClick={() => { setQuestion(q); ask(q); }} style={{ background:`${color}12`, border:`1px solid ${color}25`, color, fontSize:12, padding:'6px 14px', borderRadius:20, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>{q}</button>)}
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key==='Enter' && ask()} placeholder="Ask me anything about your career..." style={{ ...inp, flex:1 }} />
        <button onClick={() => ask()} disabled={loading||!question.trim()} style={{ background:`linear-gradient(135deg,${color},${color}cc)`, color:'#000', border:'none', borderRadius:9, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:loading?0.7:1 }}>
          {loading ? '⏳' : 'Ask AI →'}
        </button>
      </div>
      {answer && <div style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${color}25`, borderRadius:10, padding:'16px 18px' }}>
        <div style={{ fontSize:12, color, fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>🤖 AI Career Coach</div>
        <div style={{ color:'rgba(255,255,255,0.8)', fontSize:14, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{answer}</div>
      </div>}
    </div>
  );
}

// ── RESUME BUILDER ────────────────────────────────────────────
function ResumeBuilder({ token, user, API, color }) {
  const [jobTitle, setJobTitle] = useState('');
  const [resume, setResume]     = useState(null);
  const [loading, setLoading]   = useState(false);

  const build = async () => {
    if (!jobTitle.trim()) return;
    setLoading(true); setResume(null);
    try {
      const { data } = await axios.post(`${API}/api/ai/resume-builder`, { userProfile: user, jobTitle }, { headers: { Authorization: `Bearer ${token}` } });
      setResume(data.resume);
    } catch (e) { setResume({ raw: 'AI service unavailable. Please try again.' }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Target job title (e.g. AI Engineer, Data Scientist)" style={{ ...inp, flex:1 }} />
        <button onClick={build} disabled={loading||!jobTitle} style={{ background:`linear-gradient(135deg,${color},${color}cc)`, color:'#fff', border:'none', borderRadius:9, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:loading?0.7:1 }}>
          {loading ? '⏳ Building...' : '📝 Generate Resume'}
        </button>
      </div>
      {resume && (
        <div style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${color}25`, borderRadius:10, padding:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontSize:12, color, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>✅ Your AI-Generated Resume</div>
            <button onClick={() => { const el=document.createElement('a'); el.href='data:text/plain;charset=utf-8,'+encodeURIComponent(JSON.stringify(resume,null,2)); el.download='resume.json'; el.click(); }} style={{ background:`${color}18`, border:`1px solid ${color}30`, color, fontSize:12, padding:'5px 12px', borderRadius:8, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>⬇ Download</button>
          </div>
          {resume.raw ? <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{resume.raw}</div> : (
            <div>
              {resume.summary && <div style={{ marginBottom:14 }}><div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color:'#fff', marginBottom:6 }}>Professional Summary</div><p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, lineHeight:1.7 }}>{resume.summary}</p></div>}
              {resume.skills && <div style={{ marginBottom:14 }}><div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color:'#fff', marginBottom:6 }}>Skills</div><div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{(Array.isArray(resume.skills)?resume.skills:[]).map(s=><span key={s} style={{ background:`${color}18`, border:`1px solid ${color}30`, color, fontSize:11, padding:'3px 9px', borderRadius:12 }}>{s}</span>)}</div></div>}
              <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:8, padding:12 }}><pre style={{ color:'rgba(255,255,255,0.6)', fontSize:11, overflow:'auto', whiteSpace:'pre-wrap' }}>{JSON.stringify(resume,null,2)}</pre></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── INTERVIEW COACH ───────────────────────────────────────────
function InterviewCoach({ token, user, API, color }) {
  const [role, setRole]         = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer]     = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [type, setType]         = useState('technical');

  const SAMPLE_Q = { technical:['Explain the difference between supervised and unsupervised learning','What is a REST API?','How does React virtual DOM work?'], hr:['Tell me about yourself','Why do you want this job?','Where do you see yourself in 5 years?'], managerial:['How do you handle conflicts in a team?','Describe a time you led a project','How do you prioritize tasks?'] };

  const evaluate = async () => {
    if (!role||!question||!answer) return;
    setLoading(true); setFeedback(null);
    try {
      const { data } = await axios.post(`${API}/api/ai/interview-coach`, { role, question, userAnswer:answer, interviewType:type }, { headers: { Authorization:`Bearer ${token}` } });
      setFeedback(data.feedback);
    } catch (e) { setFeedback({ raw:'AI unavailable. Try again.' }); }
    finally { setLoading(false); }
  };

  const scoreColor = (score) => score>=8?'#4ade80':score>=5?'#f59e0b':'#f87171';

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['technical','hr','managerial'].map(t => <button key={t} onClick={()=>setType(t)} style={{ padding:'8px 18px', borderRadius:20, border:`1px solid ${type===t?color:'rgba(255,255,255,0.1)'}`, background:type===t?`${color}18`:'transparent', color:type===t?color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', textTransform:'capitalize' }}>{t}</button>)}
      </div>
      <div style={{ display:'grid', gap:12 }}>
        <input value={role} onChange={e=>setRole(e.target.value)} placeholder="Target role (e.g. AI Engineer, Full Stack Dev)" style={inp} />
        <div>
          <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:6, display:'block', textTransform:'uppercase', letterSpacing:1 }}>Sample Questions</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
            {(SAMPLE_Q[type]||[]).map(q=><button key={q} onClick={()=>setQuestion(q)} style={{ background:`${color}10`, border:`1px solid ${color}20`, color, fontSize:11, padding:'5px 12px', borderRadius:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>{q}</button>)}
          </div>
          <textarea value={question} onChange={e=>setQuestion(e.target.value)} rows={2} placeholder="Or type your own interview question..." style={{...inp,resize:'vertical'}} />
        </div>
        <textarea value={answer} onChange={e=>setAnswer(e.target.value)} rows={4} placeholder="Type your answer here..." style={{...inp,resize:'vertical'}} />
        <button onClick={evaluate} disabled={loading||!role||!question||!answer} style={{ background:`linear-gradient(135deg,${color},${color}bb)`, color:'#fff', border:'none', borderRadius:9, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:(!role||!question||!answer)?0.5:loading?0.7:1 }}>
          {loading?'⏳ Evaluating...':'🎤 Evaluate My Answer'}
        </button>
      </div>
      {feedback && (
        <div style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${color}25`, borderRadius:10, padding:20, marginTop:16 }}>
          {feedback.raw ? <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13, lineHeight:1.7 }}>{feedback.raw}</div> : (
            <div>
              {feedback.score !== undefined && <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div style={{ width:60, height:60, borderRadius:'50%', border:`4px solid ${scoreColor(feedback.score)}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22, color:scoreColor(feedback.score) }}>{feedback.score}/10</div>
                <div><div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color:'#fff' }}>Score</div><div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{feedback.score>=8?'Excellent!':feedback.score>=5?'Good, with improvements':'Needs more practice'}</div></div>
              </div>}
              {feedback.feedback && <div style={{ marginBottom:12 }}><div style={{ fontWeight:700, color:'#fff', marginBottom:4 }}>Feedback</div><p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, lineHeight:1.7 }}>{feedback.feedback}</p></div>}
              {feedback.ideal_answer && <div style={{ background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:8, padding:12, marginBottom:12 }}><div style={{ fontWeight:700, color:'#4ade80', marginBottom:6, fontSize:13 }}>✅ Ideal Answer</div><p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, lineHeight:1.7 }}>{feedback.ideal_answer}</p></div>}
              {feedback.tips && <div><div style={{ fontWeight:700, color:color, marginBottom:6, fontSize:13 }}>💡 Tips</div>{Array.isArray(feedback.tips)?feedback.tips.map((t,i)=><p key={i} style={{ color:'rgba(255,255,255,0.6)', fontSize:13, marginBottom:4 }}>• {t}</p>):<p style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}>{feedback.tips}</p>}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── SKILL ANALYZER ────────────────────────────────────────────
function SkillAnalyzer({ token, user, API, color }) {
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis]     = useState(null);
  const [loading, setLoading]       = useState(false);

  const analyze = async () => {
    if (!targetRole) return;
    setLoading(true); setAnalysis(null);
    try {
      const skills = (user?.skills||[]).map(s=>s.name);
      const { data } = await axios.post(`${API}/api/ai/skill-analyzer`, { skills, targetRole }, { headers:{ Authorization:`Bearer ${token}` } });
      setAnalysis(data.analysis);
    } catch(e) { setAnalysis({ raw:'AI unavailable. Try again.' }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <input value={targetRole} onChange={e=>setTargetRole(e.target.value)} placeholder="Target role (e.g. Senior AI Engineer)" style={{...inp,flex:1}} />
        <button onClick={analyze} disabled={loading||!targetRole} style={{ background:`linear-gradient(135deg,${color},${color}bb)`, color:'#fff', border:'none', borderRadius:9, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:loading?0.7:1 }}>
          {loading?'⏳ Analyzing...':'📊 Analyze Skills'}
        </button>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Your skills:</span>
        {(user?.skills||[]).map(s=><span key={s.name} style={{ background:`${color}15`, border:`1px solid ${color}30`, color, fontSize:11, padding:'3px 9px', borderRadius:12 }}>{s.name}</span>)}
        {(!user?.skills||user.skills.length===0) && <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>No skills added yet — add skills in your profile first</span>}
      </div>
      {analysis && (
        <div style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${color}25`, borderRadius:10, padding:20 }}>
          {analysis.raw ? <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{analysis.raw}</div> : (
            <div>
              {analysis.score !== undefined && <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontWeight:700, color:'#fff' }}>Match Score</span>
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, color:color }}>{analysis.score}%</span>
                </div>
                <div style={{ height:8, background:'rgba(255,255,255,0.1)', borderRadius:4 }}><div style={{ height:'100%', width:`${analysis.score}%`, background:`linear-gradient(90deg,${color},${color}aa)`, borderRadius:4, transition:'width 1s' }} /></div>
              </div>}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                {analysis.strengths && <div style={{ background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:8, padding:12 }}><div style={{ fontWeight:700, color:'#4ade80', marginBottom:6, fontSize:13 }}>✅ Strengths</div>{analysis.strengths.map((s,i)=><p key={i} style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginBottom:3 }}>• {s}</p>)}</div>}
                {analysis.gaps && <div style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:12 }}><div style={{ fontWeight:700, color:'#f87171', marginBottom:6, fontSize:13 }}>⚠️ Gaps</div>{analysis.gaps.map((g,i)=><p key={i} style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginBottom:3 }}>• {g}</p>)}</div>}
              </div>
              {analysis.roadmap && <div><div style={{ fontWeight:700, color:color, marginBottom:8 }}>🗺️ Learning Roadmap</div>{analysis.roadmap.map((step,i)=><div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}><div style={{ width:22, height:22, borderRadius:'50%', background:`${color}25`, border:`1px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color, flexShrink:0 }}>{i+1}</div><p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, lineHeight:1.5 }}>{step}</p></div>)}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── PROPOSAL WRITER ───────────────────────────────────────────
function ProposalWriter({ token, user, API, color }) {
  const [projectTitle, setProjectTitle]   = useState('');
  const [projectDesc, setProjectDesc]     = useState('');
  const [proposal, setProposal]           = useState('');
  const [loading, setLoading]             = useState(false);

  const write = async () => {
    if (!projectTitle) return;
    setLoading(true); setProposal('');
    try {
      const { data } = await axios.post(`${API}/api/ai/write-proposal`, { project:{ title:projectTitle, description:projectDesc, skills:[] }, freelancerProfile:user }, { headers:{ Authorization:`Bearer ${token}` } });
      setProposal(data.proposal);
    } catch(e) { setProposal('AI unavailable. Try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:'grid', gap:12, marginBottom:16 }}>
        <input value={projectTitle} onChange={e=>setProjectTitle(e.target.value)} placeholder="Project title (e.g. Build an e-commerce website)" style={inp} />
        <textarea value={projectDesc} onChange={e=>setProjectDesc(e.target.value)} rows={3} placeholder="Project description (optional but improves proposal quality)" style={{...inp,resize:'vertical'}} />
        <button onClick={write} disabled={loading||!projectTitle} style={{ background:`linear-gradient(135deg,${color},${color}bb)`, color:'#000', border:'none', borderRadius:9, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif', opacity:loading?0.7:1 }}>
          {loading?'⏳ Writing...':'✍️ Write Proposal'}
        </button>
      </div>
      {proposal && (
        <div style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${color}25`, borderRadius:10, padding:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:12, color, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>✅ Your AI Proposal</div>
            <button onClick={()=>navigator.clipboard.writeText(proposal)} style={{ background:`${color}18`, border:`1px solid ${color}30`, color, fontSize:12, padding:'5px 12px', borderRadius:8, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>📋 Copy</button>
          </div>
          <div style={{ color:'rgba(255,255,255,0.8)', fontSize:14, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{proposal}</div>
        </div>
      )}
    </div>
  );
}

// ── JOB MATCHER ───────────────────────────────────────────────
function JobMatcher({ token, user, API, color }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const match = async () => {
    setLoading(true); setMatches([]);
    try {
      const pRes = await axios.get(`${API}/api/projects?limit=20`);
      const projects = pRes.data.projects || [];
      if (projects.length === 0) { setMatches([]); setLoading(false); return; }
      const skills = (user?.skills||[]).map(s=>s.name);
      const { data } = await axios.post(`${API}/api/ai/match-projects`, { userSkills:skills, projects }, { headers:{ Authorization:`Bearer ${token}` } });
      const matched = (data.matches||[]).map(m => ({ ...m, project:projects.find(p=>p._id?.toString()===m.id?.toString()) })).filter(m=>m.project).sort((a,b)=>b.score-a.score);
      setMatches(matched);
    } catch(e) { setMatches([]); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, marginBottom:16, lineHeight:1.7 }}>AI will analyze open projects and rank them by how well they match your skills: <strong style={{ color }}>{(user?.skills||[]).map(s=>s.name).join(', ')||'No skills added yet'}</strong></p>
      <button onClick={match} disabled={loading} style={{ background:`linear-gradient(135deg,${color},${color}bb)`, color:'#000', border:'none', borderRadius:9, padding:'12px 28px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif', marginBottom:20, opacity:loading?0.7:1 }}>
        {loading?'⏳ Matching...':'🔍 Find Best Matches'}
      </button>
      {matches.length > 0 && (
        <div style={{ display:'grid', gap:12 }}>
          {matches.map((m,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${m.score>=80?'rgba(74,222,128,0.3)':m.score>=50?`${color}30`:'rgba(255,255,255,0.1)'}`, borderRadius:12, padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:56, height:56, borderRadius:10, background:m.score>=80?'rgba(74,222,128,0.1)':m.score>=50?`${color}15`:'rgba(255,255,255,0.05)', border:`2px solid ${m.score>=80?'#4ade80':m.score>=50?color:'rgba(255,255,255,0.1)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:18, color:m.score>=80?'#4ade80':m.score>=50?color:'rgba(255,255,255,0.4)', flexShrink:0 }}>{m.score}%</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#fff', marginBottom:4 }}>{m.project?.title}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>{m.project?.category} · ₹{m.project?.budget?.min?.toLocaleString()}-{m.project?.budget?.max?.toLocaleString()}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', fontStyle:'italic' }}>"{m.reason}"</div>
              </div>
              <a href={`/projects/${m.project?._id}`} style={{ background:`${color}18`, border:`1px solid ${color}30`, color, padding:'8px 14px', borderRadius:8, textDecoration:'none', fontSize:12, fontWeight:600, flexShrink:0 }}>Apply →</a>
            </div>
          ))}
        </div>
      )}
      {!loading && matches.length === 0 && <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.3)', fontSize:14 }}>Click "Find Best Matches" to see AI-ranked projects for your skills</div>}
    </div>
  );
}

const inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'11px 13px', color:'#fff', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif' };
