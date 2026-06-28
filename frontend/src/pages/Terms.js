import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav';

export default function Terms() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <TopNav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-faint)', fontSize: 12, marginBottom: 28 }}>Last updated: June 2026</p>

        {SECTIONS.map(s => (
          <div key={s.title} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{s.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.8 }}>{s.body}</p>
          </div>
        ))}

        <p style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: 32 }}>
          Questions? <Link to="/messages" style={{ color: 'var(--accent)' }}>Contact us</Link> or see our <Link to="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

const SECTIONS = [
  { title: '1. Acceptance of terms', body: 'By creating an account or using NexWork, you agree to these Terms of Service. If you do not agree, please do not use the platform.' },
  { title: '2. What NexWork is', body: 'NexWork is a marketplace connecting freelancers, service providers, students, job seekers, mentors, and clients in India. We facilitate discovery, communication, and payment between users — we are not a party to the work agreements formed between users.' },
  { title: '3. Accounts and eligibility', body: 'You must provide accurate information when creating an account and are responsible for keeping your login credentials secure. You must be at least 18 years old, or have parental consent where permitted by law, to use NexWork.' },
  { title: '4. Payments and fees', body: 'NexWork charges a flat 10% platform fee on completed service orders, deducted from the amount paid to the provider. Payments are held in escrow until the client approves delivered work. Withdrawal requests are processed manually within 24–48 hours.' },
  { title: '5. Conduct', body: 'You agree not to use NexWork for fraud, harassment, spam, or to circumvent the platform fee by arranging payment outside the platform after connecting through it. Violations may result in account suspension.' },
  { title: '6. Disputes', body: 'If a client and provider disagree about delivered work, either party can flag the order for admin review. NexWork will make a good-faith effort to mediate but is not obligated to resolve every dispute in either party\u2019s favor.' },
  { title: '7. Content and intellectual property', body: 'You retain ownership of content you upload (portfolio items, project descriptions, etc.) but grant NexWork a license to display it on the platform. Work product ownership between clients and freelancers is governed by their own agreement, not by NexWork.' },
  { title: '8. Limitation of liability', body: 'NexWork is provided "as is." We are not liable for the quality, legality, or outcome of work performed by users, or for losses arising from disputes between users. Our total liability for any claim is limited to fees you paid to NexWork in the preceding 3 months.' },
  { title: '9. Termination', body: 'We may suspend or terminate accounts that violate these terms, engage in fraud, or pose a risk to other users. You may delete your account at any time by contacting support.' },
  { title: '10. Changes to these terms', body: 'We may update these terms from time to time. Continued use of NexWork after changes take effect constitutes acceptance of the updated terms.' },
];
