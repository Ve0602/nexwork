import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ROLE_LABELS = { freelancer:'Freelancer', client:'Client', student:'Student', jobseeker:'Job seeker', service_provider:'Service provider', mentor:'Mentor', trainer:'Trainer', recruiter:'Recruiter', professional:'Professional', admin:'Admin' };

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
      try { const sRes = await axios.get(`${API}/api/services?search=${data.name}`); setServices((sRes.data.services||[]).filter(s => s.providerId?._id === id)); } catch(e) {}
    } catch(e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  const isOwnProfile = currentUser?.id === id;

  if (loading) return <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}><TopNav /><div style={{ textAlign:'center', padding:80, color:'var(--text-muted)', fontSize:13 }}>Loading profile…</div></div>;
  if (!profile) return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ textAlign:'center', padding:80 }}>
        <h2 style={{ fontSize:18, fontWeight:600, marginBottom:12 }}>Profile not found</h2>
        <Link to="/find-talent" style={{ color:'var(--accent)', fontSize:13 }}>← Back to find talent</Link>
      </div>
    </div>
  );

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', color:'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 24px' }}>

        <Link to="/find-talent" style={{ color:'var(--text-faint)', fontSize:13, display:'inline-block', marginBottom:20 }}>← Back to find talent</Link>

        <div className="card" style={{ padding: 24, marginBottom: 20, display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {profile.photo ? <img src={profile.photo} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            : <div className="mono" style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 600, flexShrink: 0 }}>{profile.name?.[0]?.toUpperCase()}</div>
          }
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 20, fontWeight: 600 }}>{profile.name}</h1>
              {profile.isVerified && <span className="tag tag-success">Verified</span>}
            </div>
            <div style={{ color:'var(--accent)', fontWeight:500, fontSize:13, marginTop:4 }}>{ROLE_LABELS[profile.primaryRole]||profile.primaryRole}</div>
            {profile.headline && <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:8 }}>{profile.headline}</p>}
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap', fontSize:12, color:'var(--text-faint)' }}>
              {profile.city && <span>{profile.city}{profile.state?`, ${profile.state}`:''}</span>}
              {profile.rating > 0 && <span>★ {profile.rating} ({profile.reviewCount})</span>}
              {profile.hourlyRate > 0 && <span style={{ color:'var(--success)' }}>₹{profile.hourlyRate}/hr</span>}
            </div>
          </div>
          {!isOwnProfile && token && <Link to={`/messages?to=${profile._id}`} className="btn btn-primary" style={{ flexShrink: 0 }}>Message</Link>}
          {isOwnProfile && <Link to="/profile/edit" className="btn btn-secondary" style={{ flexShrink: 0 }}>Edit profile</Link>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
          <div>
            {profile.bio && <div className="card" style={{ padding: 20, marginBottom: 16 }}><h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>About</h3><p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{profile.bio}</p></div>}

            {(profile.skills||[]).length > 0 && (
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>{profile.skills.map(s => <span key={s.name} className="tag tag-accent">{s.name}{s.verified && ' ✓'}</span>)}</div>
              </div>
            )}

            {(profile.experience||[]).length > 0 && (
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Experience</h3>
                {profile.experience.map((exp,i) => (
                  <div key={i} style={{ marginBottom: i<profile.experience.length-1?14:0, paddingBottom: i<profile.experience.length-1?14:0, borderBottom: i<profile.experience.length-1?'1px solid var(--border)':'none' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{exp.title}</div>
                    <div style={{ color:'var(--accent)', fontSize: 12, marginBottom: 2 }}>{exp.company}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom:exp.desc?6:0 }}>{exp.from} – {exp.current?'Present':exp.to}</div>
                    {exp.desc && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{exp.desc}</p>}
                  </div>
                ))}
              </div>
            )}

            {(profile.education||[]).length > 0 && (
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Education</h3>
                {profile.education.map((edu,i) => (
                  <div key={i} style={{ marginBottom: i<profile.education.length-1?12:0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{edu.degree}</div>
                    <div style={{ color:'var(--accent)', fontSize: 12 }}>{edu.institution}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{edu.year} {edu.grade&&`· ${edu.grade}`}</div>
                  </div>
                ))}
              </div>
            )}

            {services.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Services offered</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {services.map(s => (
                    <Link key={s._id} to="/services" className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{s.title}</span>
                      {s.packages?.[0] && <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>from ₹{s.packages[0].price}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card" style={{ padding: 18, marginBottom: 14 }}>
              <h4 style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Stats</h4>
              {[['Rating', profile.rating>0?`${profile.rating} (${profile.reviewCount})`:'No reviews yet'],['Jobs done', profile.totalJobs||0],['Total earned', profile.totalEarned?`₹${profile.totalEarned.toLocaleString()}`:'—']].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-faint)' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {(profile.linkedinUrl || profile.githubUrl || profile.websiteUrl) && (
              <div className="card" style={{ padding: 18 }}>
                <h4 style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Links</h4>
                <div style={{ display: 'grid', gap: 7 }}>
                  {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ color:'var(--accent)', fontSize: 12 }}>LinkedIn →</a>}
                  {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ color:'var(--text)', fontSize: 12 }}>GitHub →</a>}
                  {profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noreferrer" style={{ color:'var(--accent)', fontSize: 12 }}>Website →</a>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
