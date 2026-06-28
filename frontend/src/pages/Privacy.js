import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav';

export default function Privacy() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-faint)', fontSize: 12, marginBottom: 28 }}>Last updated: June 2026</p>

        {SECTIONS.map(s => (
          <div key={s.title} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{s.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.8 }}>{s.body}</p>
          </div>
        ))}

        <p style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: 32 }}>
          See also our <Link to="/terms" style={{ color: 'var(--accent)' }}>Terms of Service</Link>.
        </p>
      </div>
    </div>
  );
}

const SECTIONS = [
  { title: '1. What we collect', body: 'When you create an account, we collect your name, email, phone (optional), and any profile details you choose to add — skills, experience, education, portfolio, location. When you make or receive a payment, our payment processor (Razorpay) collects and processes the relevant financial details; NexWork does not store your card or bank details directly.' },
  { title: '2. How we use your data', body: 'We use your information to operate the platform: matching you with relevant projects or talent, processing payments, sending transactional emails (order updates, proposal notifications, verification), and improving the service. We do not sell your personal data to third parties.' },
  { title: '3. AI features', body: 'Our AI tools (resume builder, career coach, interview coach, proposal writer, skill analyzer, job matcher) send relevant profile and request data to Anthropic\u2019s Claude API to generate responses. This data is used to generate your result and is not used to train Anthropic\u2019s models per their API terms.' },
  { title: '4. Data sharing', body: 'Your public profile (name, headline, skills, ratings, portfolio) is visible to other users by design \u2014 that\u2019s how the marketplace works. Your email and phone number are private and only shared with a client or freelancer once you choose to message them.' },
  { title: '5. Cookies and local storage', body: 'We use browser local storage to keep you signed in and to remember your light/dark theme preference. We do not use third-party advertising trackers.' },
  { title: '6. Data retention', body: 'We retain your account data as long as your account is active. If you delete your account, we remove personally identifying information within a reasonable period, except where we are required to retain transaction records for legal or accounting purposes.' },
  { title: '7. Your rights', body: 'You can view and edit most of your data directly from your profile settings. To request a full export or deletion of your data, contact support through the Messages feature or the email on file with your account.' },
  { title: '8. Security', body: 'Passwords are hashed and never stored in plain text. We use industry-standard practices to protect data in transit (HTTPS) and limit access to production data to authorized personnel only.' },
  { title: '9. Children\u2019s privacy', body: 'NexWork is not directed at children under 18. We do not knowingly collect data from minors without appropriate consent.' },
  { title: '10. Changes to this policy', body: 'We may update this policy as the platform evolves. Material changes will be communicated via email or an in-app notice.' },
];
