import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ROLE_LABELS = { freelancer:'Freelancer', client:'Client', student:'Student', jobseeker:'Job Seeker', service_provider:'Service Provider', mentor:'Mentor', trainer:'Trainer', recruiter:'Recruiter', professional:'Professional', admin:'Admin' };

export default function TalentProfile() {
  const { id } = useParams();
  const { token, user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/users/${id}`);
      setProfile(data);
      try {
        const sRes = await axios.get(`${API}/api/services?search=${data.name}`);
        setServices((sRes.data.services||[]).filter(s => s.providerId?._id === id));
      } catch(e) {}
    } catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const gold = '#d4a853';
  const isOwnProfile = currentUser?.id === id;

  if (loading) return <div style={{ background:'#07070f', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:gold, fontFamily:'Syne,sans-serif', paddingTop:64 }}>Loading profile...</div>;
  if (!profile) return (
    <div style={{ background:'#07070f', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'DM Sans,sans-serif', paddingTop:64, gap:16 }}>
      <div style={{ fontSize:48 }}>👤</div>
      <h2 style={{ fontFamily:'Syne,sans-serif' }}>Profile not found</h2>
      <Link to="/find-talent" style={{ color:gold, textDecoration:'none' }}>← Back to Find Talent</Link>
    </div>
  );

  return (
    <div style={{ background:'#07070f', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#fff', paddingTop:64 }}>

      <div style={{ background:`linear-gradient(135deg,${gold}15,#0d0820)`, padding:'40px 60px 70px', borderBottom:'1px solid rgba(255,255,255,0.06)', position:'relative' }}>
        <Link to="/find-talent" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:13 }}>← Back to Find Talent</Link>
      </div>

      <div style={{ maxWidth:900, margin:'-50px auto 0', padding:'0 20px 60px', position:'relative' }}>

        <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:28, marginBottom:24, display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
          {profile.photo ? <img src={profile.photo} alt="" style={{ width:88, height:88, borderRadius:'50%', objectFit:'cover', border:`3px solid ${gold}`, flexShrink:0 }} />
            : <div style={{ width:88, height:88, borderRadius:'50%', background:`${gold}20`, border:`3px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:700, color:gold, flexShrink:0 }}>{profile.name?.[0]?.toUpperCase()}</div>
          }
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24 }}>{profile.name}</h1>
              {profile.isVerified && <span style={{ background:'rgba(74,222,128,0.15)', color:'#4ade80', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:12 }}>✓ Verified</span>}
            </div>
            <div style={{ color:gold, fontWeight:600, fontSize:14, marginTop:4, textTransform:'capitalize' }}>{ROLE_LABELS[profile.primaryRole]||profile.primaryRole}</div>
            {profile.headline && <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, marginTop:8 }}>{profile.headline}</p>}
            <div style={{ display:'flex', gap:16, marginTop:12, flexWrap:'wrap' }}>
              {profile.city && <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>📍 {profile.city}{profile.state?`, ${profile.state}`:''}</span>}
              {profile.rating > 0 && <span style={{ fontSize:13, color:gold }}>★ {profile.rating} ({profile.reviewCount} reviews)</span>}
              {profile.hourlyRate > 0 && <span style={{ fontSize:13, color:'#4ade80', fontWeight:600 }}>₹{profile.hourlyRate}/hr</span>}
              <span style={{ fontSize:13, color: profile.availability==='available'?'#4ade80':'rgba(255,255,255,0.3)' }}>{profile.availability==='available'?'✅ Available':profile.availability==='busy'?'⚡ Busy':'⛔ Unavailable'}</span>
            </div>
          </div>
          {!isOwnProfile && token && (
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              <Link to={`/messages?to=${profile._id}`} style={{ background:`linear-gradient(135deg,${gold},#b8860b)`, color:'#000', textDecoration:'none', padding:'10px 20px', borderRadius:9, fontWeight:700, fontSize:13 }}>💬 Message</Link>
            </div>
          )}
          {isOwnProfile && <Link to="/profile/edit" style={{ background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.6)', textDecoration:'none', padding:'10px 20px', borderRadius:9, fontWeight:600, fontSize:13 }}>✏️ Edit Profile</Link>}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }}>
          <div>
            {profile.bio && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:22, marginBottom:18 }}>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:10 }}>👤 About</h3>
                <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{profile.bio}</p>
              </div>
            )}

            {(profile.skills||[]).length > 0 && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:22, marginBottom:18 }}>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:12 }}>🛠 Skills</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {profile.skills.map(s => (
                    <span key={s.name} style={{ background:`${gold}15`, border:`1px solid ${gold}30`, color:gold, fontSize:12, padding:'6px 14px', borderRadius:16, display:'flex', alignItems:'center', gap:6 }}>
                      {s.name} {s.verified && '✓'}
                      <span style={{ fontSize:10, opacity:0.6, textTransform:'capitalize' }}>· {s.level}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(profile.experience||[]).length > 0 && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:22, marginBottom:18 }}>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:14 }}>💼 Experience</h3>
                {profile.experience.map((exp,i) => (
                  <div key={i} style={{ marginBottom: i<profile.experience.length-1?16:0, paddingBottom: i<profile.experience.length-1?16:0, borderBottom: i<profile.experience.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:2 }}>{exp.title}</div>
                    <div style={{ color:gold, fontSize:13, marginBottom:3 }}>{exp.company}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:exp.desc?8:0 }}>{exp.from} – {exp.current?'Present':exp.to}</div>
                    {exp.desc && <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>{exp.desc}</p>}
                  </div>
                ))}
              </div>
            )}

            {(profile.education||[]).length > 0 && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:22, marginBottom:18 }}>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:14 }}>🎓 Education</h3>
                {profile.education.map((edu,i) => (
                  <div key={i} style={{ marginBottom: i<profile.education.length-1?14:0 }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14 }}>{edu.degree}</div>
                    <div style={{ color:'#a78bfa', fontSize:13 }}>{edu.institution}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{edu.year} {edu.grade&&`· ${edu.grade}`}</div>
                  </div>
                ))}
              </div>
            )}

            {services.length > 0 && (
              <div style={{ marginBottom:18 }}>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:14 }}>🛍️ Services Offered</h3>
                <div style={{ display:'grid', gap:10 }}>
                  {services.map(s => (
                    <Link key={s._id} to="/services" style={{ textDecoration:'none', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ color:'#fff', fontSize:14, fontWeight:600 }}>{s.title}</span>
                      {s.packages?.[0] && <span style={{ color:gold, fontFamily:'Syne,sans-serif', fontWeight:700 }}>from ₹{s.packages[0].price}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:20, marginBottom:16 }}>
              <h4 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:14, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1 }}>Stats</h4>
              {[['⭐ Rating', profile.rating>0?`${profile.rating} (${profile.reviewCount})`:'No reviews yet'],['💼 Jobs Done', profile.totalJobs||0],['💰 Total Earned', profile.totalEarned?`₹${profile.totalEarned.toLocaleString()}`:'—']].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:13 }}>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>{k}</span>
                  <span style={{ color:'#fff', fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>

            {(profile.linkedinUrl || profile.githubUrl || profile.websiteUrl) && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:20 }}>
                <h4 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:12, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1 }}>Links</h4>
                <div style={{ display:'grid', gap:8 }}>
                  {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ color:'#0a66c2', fontSize:13, textDecoration:'none' }}>💼 LinkedIn →</a>}
                  {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ color:'#fff', fontSize:13, textDecoration:'none' }}>🐙 GitHub →</a>}
                  {profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noreferrer" style={{ color:gold, fontSize:13, textDecoration:'none' }}>🌐 Website →</a>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
    </div>
  );
}
