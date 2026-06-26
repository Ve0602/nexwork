import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TOOLS = [
  { id:'career',    title:'Career coach',     desc:'Personalized career advice and growth roadmap' },
  { id:'resume',    title:'Resume builder',   desc:'ATS-optimized resume for any role' },
  { id:'interview', title:'Interview coach',  desc:'Practice interviews with real-time feedback' },
  { id:'skills',    title:'Skill analyzer',   desc:'Find skill gaps and a learning roadmap' },
  { id:'proposal',  title:'Proposal writer',  desc:'Write winning proposals instantly' },
  { id:'match',     title:'Job matcher',      desc:'Best matching projects for your skills' },
];

export default function AITools() {
  const { user, token } = useAuth();
  const [activeTool, setActiveTool] = useState('career');
  const tool = TOOLS.find(t => t.id === activeTool);

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Powered by Claude</div>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>AI tools</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 28 }}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setActiveTool(t.id)} className="card" style={{ padding: '14px', textAlign: 'left', cursor: 'pointer', borderColor: activeTool===t.id ? 'var(--accent)' : 'var(--border)', background: activeTool===t.id ? 'var(--accent-subtle)' : 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: activeTool===t.id ? 'var(--accent)' : 'var(--text)', marginBottom: 4 }}>{t.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{tool.title}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{tool.desc}</p>

          {activeTool === 'career'    && <CareerCoach    token={token} user={user} />}
          {activeTool === 'resume'    && <ResumeBuilder  token={token} user={user} />}
          {activeTool === 'interview' && <InterviewCoach token={token} user={user} />}
          {activeTool === 'skills'    && <SkillAnalyzer  token={token} user={user} />}
          {activeTool === 'proposal'  && <ProposalWriter token={token} user={user} />}
          {activeTool === 'match'     && <JobMatcher     token={token} user={user} />}
        </div>
      </div>
    </div>
  );
}

function CareerCoach({ token, user }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const QUICK = ['How do I grow as a freelancer?','What skills should I learn next?','How do I get my first client?','How to increase my hourly rate?'];

  const ask = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    setLoading(true); setAnswer('');
    try {
      const { data } = await axios.post(`${API}/api/ai/career-coach`, { question: query, userProfile: user }, { headers: { Authorization: `Bearer ${token}` } });
      setAnswer(data.answer);
    } catch (e) { setAnswer('AI service is temporarily unavailable.'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
        {QUICK.map(q => <button key={q} onClick={() => { setQuestion(q); ask(q); }} className="tag" style={{ cursor:'pointer' }}>{q}</button>)}
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key==='Enter' && ask()} placeholder="Ask about your career…" className="input" />
        <button onClick={() => ask()} disabled={loading||!question.trim()} className="btn btn-primary">{loading ? '…' : 'Ask'}</button>
      </div>
      {answer && <div className="card" style={{ padding: '14px 16px', background:'var(--bg-subtle)' }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing:'0.04em' }}>Career coach</div>
        <div style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{answer}</div>
      </div>}
    </div>
  );
}

function ResumeBuilder({ token, user }) {
  const [jobTitle, setJobTitle] = useState('');
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);

  const build = async () => {
    if (!jobTitle.trim()) return;
    setLoading(true); setResume(null);
    try {
      const { data } = await axios.post(`${API}/api/ai/resume-builder`, { userProfile: user, jobTitle }, { headers: { Authorization: `Bearer ${token}` } });
      setResume(data.resume);
    } catch (e) { setResume({ raw: 'AI service unavailable.' }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Target job title" className="input" />
        <button onClick={build} disabled={loading||!jobTitle} className="btn btn-primary">{loading ? 'Building…' : 'Generate'}</button>
      </div>
      {resume && (
        <div className="card" style={{ padding: 18, background:'var(--bg-subtle)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:11, color:'var(--accent)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>Generated resume</div>
            <button onClick={() => { const el=document.createElement('a'); el.href='data:text/plain;charset=utf-8,'+encodeURIComponent(JSON.stringify(resume,null,2)); el.download='resume.json'; el.click(); }} className="btn btn-ghost" style={{ fontSize:11, padding:0 }}>Download</button>
          </div>
          {resume.raw ? <div style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{resume.raw}</div> : (
            <div>
              {resume.summary && <div style={{ marginBottom:14 }}><div style={{ fontWeight:600, fontSize:13, marginBottom:6 }}>Summary</div><p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.7 }}>{resume.summary}</p></div>}
              {resume.skills && <div style={{ marginBottom:14 }}><div style={{ fontWeight:600, fontSize:13, marginBottom:6 }}>Skills</div><div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{(Array.isArray(resume.skills)?resume.skills:[]).map(s=><span key={s} className="tag tag-accent">{s}</span>)}</div></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InterviewCoach({ token, user }) {
  const [role, setRole] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('technical');
  const SAMPLE_Q = { technical:['Explain supervised vs unsupervised learning','What is a REST API?'], hr:['Tell me about yourself','Why this job?'], managerial:['How do you handle team conflict?','Describe leading a project'] };

  const evaluate = async () => {
    if (!role||!question||!answer) return;
    setLoading(true); setFeedback(null);
    try {
      const { data } = await axios.post(`${API}/api/ai/interview-coach`, { role, question, userAnswer:answer, interviewType:type }, { headers: { Authorization:`Bearer ${token}` } });
      setFeedback(data.feedback);
    } catch (e) { setFeedback({ raw:'AI unavailable.' }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['technical','hr','managerial'].map(t => <button key={t} onClick={()=>setType(t)} className="tag" style={{ cursor:'pointer', textTransform:'capitalize', background: type===t?'var(--accent-subtle)':'var(--bg)', color: type===t?'var(--accent)':'var(--text-muted)', border:`1px solid ${type===t?'transparent':'var(--border)'}` }}>{t}</button>)}
      </div>
      <div style={{ display:'grid', gap:12 }}>
        <input value={role} onChange={e=>setRole(e.target.value)} placeholder="Target role" className="input" />
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 6 }}>Sample questions</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
            {(SAMPLE_Q[type]||[]).map(q=><button key={q} onClick={()=>setQuestion(q)} className="tag" style={{ cursor:'pointer' }}>{q}</button>)}
          </div>
          <textarea value={question} onChange={e=>setQuestion(e.target.value)} rows={2} placeholder="Or type your own question…" className="input" style={{ resize:'vertical' }} />
        </div>
        <textarea value={answer} onChange={e=>setAnswer(e.target.value)} rows={4} placeholder="Your answer…" className="input" style={{ resize:'vertical' }} />
        <button onClick={evaluate} disabled={loading||!role||!question||!answer} className="btn btn-primary" style={{ opacity:(!role||!question||!answer)?0.5:1 }}>{loading?'Evaluating…':'Evaluate my answer'}</button>
      </div>
      {feedback && (
        <div className="card" style={{ padding:18, marginTop:16, background:'var(--bg-subtle)' }}>
          {feedback.raw ? <div style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.7 }}>{feedback.raw}</div> : (
            <div>
              {feedback.score !== undefined && <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div className="mono" style={{ width:48, height:48, borderRadius:'50%', border:`2px solid var(--accent)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:14 }}>{feedback.score}/10</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{feedback.score>=8?'Excellent':feedback.score>=5?'Good, with room to improve':'Needs more practice'}</div>
              </div>}
              {feedback.feedback && <div style={{ marginBottom:12 }}><div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>Feedback</div><p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.7 }}>{feedback.feedback}</p></div>}
              {feedback.ideal_answer && <div className="card" style={{ padding:12, marginBottom:12, background:'var(--success-bg)' }}><div style={{ fontWeight:600, color:'var(--success)', marginBottom:6, fontSize:13 }}>Ideal answer</div><p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.7 }}>{feedback.ideal_answer}</p></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SkillAnalyzer({ token, user }) {
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!targetRole) return;
    setLoading(true); setAnalysis(null);
    try {
      const skills = (user?.skills||[]).map(s=>s.name);
      const { data } = await axios.post(`${API}/api/ai/skill-analyzer`, { skills, targetRole }, { headers:{ Authorization:`Bearer ${token}` } });
      setAnalysis(data.analysis);
    } catch(e) { setAnalysis({ raw:'AI unavailable.' }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <input value={targetRole} onChange={e=>setTargetRole(e.target.value)} placeholder="Target role" className="input" />
        <button onClick={analyze} disabled={loading||!targetRole} className="btn btn-primary">{loading?'Analyzing…':'Analyze'}</button>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
        <span style={{ fontSize:12, color:'var(--text-faint)' }}>Your skills:</span>
        {(user?.skills||[]).map(s=><span key={s.name} className="tag tag-accent">{s.name}</span>)}
      </div>
      {analysis && (
        <div className="card" style={{ padding:18, background:'var(--bg-subtle)' }}>
          {analysis.raw ? <div style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.7 }}>{analysis.raw}</div> : (
            <div>
              {analysis.score !== undefined && <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ fontWeight:600, fontSize:13 }}>Match score</span><span className="mono" style={{ fontWeight:600 }}>{analysis.score}%</span></div>
                <div style={{ height:6, background:'var(--border)', borderRadius:3 }}><div style={{ height:'100%', width:`${analysis.score}%`, background:'var(--accent)', borderRadius:3 }} /></div>
              </div>}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {analysis.strengths && <div className="card" style={{ padding:12, background:'var(--success-bg)' }}><div style={{ fontWeight:600, color:'var(--success)', marginBottom:6, fontSize:13 }}>Strengths</div>{analysis.strengths.map((s,i)=><p key={i} style={{ color:'var(--text-muted)', fontSize:12, marginBottom:3 }}>· {s}</p>)}</div>}
                {analysis.gaps && <div className="card" style={{ padding:12, background:'var(--danger-bg)' }}><div style={{ fontWeight:600, color:'var(--danger)', marginBottom:6, fontSize:13 }}>Gaps</div>{analysis.gaps.map((g,i)=><p key={i} style={{ color:'var(--text-muted)', fontSize:12, marginBottom:3 }}>· {g}</p>)}</div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProposalWriter({ token, user }) {
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [proposal, setProposal] = useState('');
  const [loading, setLoading] = useState(false);

  const write = async () => {
    if (!projectTitle) return;
    setLoading(true); setProposal('');
    try {
      const { data } = await axios.post(`${API}/api/ai/write-proposal`, { project:{ title:projectTitle, description:projectDesc, skills:[] }, freelancerProfile:user }, { headers:{ Authorization:`Bearer ${token}` } });
      setProposal(data.proposal);
    } catch(e) { setProposal('AI unavailable.'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:'grid', gap:12, marginBottom:16 }}>
        <input value={projectTitle} onChange={e=>setProjectTitle(e.target.value)} placeholder="Project title" className="input" />
        <textarea value={projectDesc} onChange={e=>setProjectDesc(e.target.value)} rows={3} placeholder="Project description (optional)" className="input" style={{ resize:'vertical' }} />
        <button onClick={write} disabled={loading||!projectTitle} className="btn btn-primary">{loading?'Writing…':'Write proposal'}</button>
      </div>
      {proposal && (
        <div className="card" style={{ padding:18, background:'var(--bg-subtle)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontSize:11, color:'var(--accent)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>Proposal</div>
            <button onClick={()=>navigator.clipboard.writeText(proposal)} className="btn btn-ghost" style={{ fontSize:11, padding:0 }}>Copy</button>
          </div>
          <div style={{ color:'var(--text)', fontSize:13, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{proposal}</div>
        </div>
      )}
    </div>
  );
}

function JobMatcher({ token, user }) {
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
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:16, lineHeight:1.7 }}>AI ranks open projects by fit with your skills: <strong style={{ color:'var(--text)' }}>{(user?.skills||[]).map(s=>s.name).join(', ')||'none added yet'}</strong></p>
      <button onClick={match} disabled={loading} className="btn btn-primary" style={{ marginBottom:20 }}>{loading?'Matching…':'Find best matches'}</button>
      {matches.length > 0 && (
        <div style={{ display:'grid', gap:10 }}>
          {matches.map((m,i) => (
            <div key={i} className="card" style={{ padding:'14px 16px', display:'flex', gap:14, alignItems:'flex-start' }}>
              <div className="mono" style={{ width:48, height:48, borderRadius:8, background: m.score>=80?'var(--success-bg)':'var(--bg-subtle)', color: m.score>=80?'var(--success)':'var(--text-muted)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:14, flexShrink:0 }}>{m.score}%</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{m.project?.title}</div>
                <div style={{ fontSize:12, color:'var(--text-faint)', marginBottom:6 }}>{m.project?.category} · ₹{m.project?.budget?.min?.toLocaleString()}–{m.project?.budget?.max?.toLocaleString()}</div>
                <div style={{ fontSize:13, color:'var(--text-muted)', fontStyle:'italic' }}>{m.reason}</div>
              </div>
              <a href={`/projects/${m.project?._id}`} className="btn btn-secondary" style={{ flexShrink:0 }}>Apply →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
