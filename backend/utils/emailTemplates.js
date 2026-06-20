const gold = '#d4a853';
const wrap = (innerHtml) => `
<div style="font-family:'Segoe UI',Arial,sans-serif; background:#07070f; padding:40px 20px;">
  <div style="max-width:520px; margin:0 auto; background:#111; border-radius:16px; overflow:hidden; border:1px solid rgba(212,168,83,0.2);">
    <div style="background:linear-gradient(135deg,${gold},#b8860b); padding:24px 32px;">
      <div style="font-family:Georgia,serif; font-weight:900; font-size:22px; color:#000;">NexWork</div>
    </div>
    <div style="padding:32px;">
      ${innerHtml}
    </div>
    <div style="padding:20px 32px; background:#0a0a0a; text-align:center;">
      <p style="color:rgba(255,255,255,0.3); font-size:11px; margin:0;">© 2026 NexWork · Warangal, India</p>
    </div>
  </div>
</div>`;

const btn = (text, url) => `
<a href="${url}" style="display:inline-block; background:linear-gradient(135deg,${gold},#b8860b); color:#000; text-decoration:none; padding:12px 28px; border-radius:9px; font-weight:700; font-size:14px; margin-top:16px;">${text}</a>`;

module.exports = {

  welcome: ({ userName, frontendUrl }) => wrap(`
    <h2 style="color:#fff; font-size:22px; margin:0 0 12px;">Welcome to NexWork, ${userName}! 🎉</h2>
    <p style="color:rgba(255,255,255,0.6); font-size:14px; line-height:1.7;">You've joined India's AI-powered freelance and hiring platform. Start exploring projects, services, and AI tools to grow your career.</p>
    ${btn('Go to Dashboard →', `${frontendUrl||'https://nexwork.vercel.app'}/dashboard`)}
  `),

  newProposal: ({ clientName, projectTitle, freelancerName, bid, frontendUrl }) => wrap(`
    <h2 style="color:#fff; font-size:20px; margin:0 0 12px;">📬 New Proposal Received</h2>
    <p style="color:rgba(255,255,255,0.6); font-size:14px; line-height:1.7;">Hi ${clientName}, <strong style="color:${gold}">${freelancerName}</strong> submitted a proposal for your project <strong>"${projectTitle}"</strong> with a bid of <strong style="color:${gold}">₹${bid}</strong>.</p>
    ${btn('View Proposal →', `${frontendUrl||'https://nexwork.vercel.app'}/my-projects`)}
  `),

  proposalAccepted: ({ freelancerName, projectTitle, frontendUrl }) => wrap(`
    <h2 style="color:#4ade80; font-size:20px; margin:0 0 12px;">✅ Your Proposal Was Accepted!</h2>
    <p style="color:rgba(255,255,255,0.6); font-size:14px; line-height:1.7;">Congratulations ${freelancerName}! Your proposal for <strong>"${projectTitle}"</strong> has been accepted. The project is now active.</p>
    ${btn('View Project →', `${frontendUrl||'https://nexwork.vercel.app'}/my-projects`)}
  `),

  newOrder: ({ providerName, clientName, serviceTitle, amount, frontendUrl }) => wrap(`
    <h2 style="color:#fff; font-size:20px; margin:0 0 12px;">🛒 New Order Received!</h2>
    <p style="color:rgba(255,255,255,0.6); font-size:14px; line-height:1.7;">Hi ${providerName}, <strong style="color:${gold}">${clientName}</strong> just ordered your service <strong>"${serviceTitle}"</strong> for <strong style="color:${gold}">₹${amount}</strong>.</p>
    ${btn('View Order →', `${frontendUrl||'https://nexwork.vercel.app'}/my-orders`)}
  `),

  paymentReceived: ({ providerName, amount, frontendUrl }) => wrap(`
    <h2 style="color:#4ade80; font-size:20px; margin:0 0 12px;">💰 Payment Received</h2>
    <p style="color:rgba(255,255,255,0.6); font-size:14px; line-height:1.7;">Hi ${providerName}, the client has paid <strong style="color:${gold}">₹${amount}</strong> for your service. The order is now active — get started on the work!</p>
    ${btn('View Order →', `${frontendUrl||'https://nexwork.vercel.app'}/my-orders`)}
  `),

  orderDelivered: ({ clientName, serviceTitle, frontendUrl }) => wrap(`
    <h2 style="color:#fff; font-size:20px; margin:0 0 12px;">📦 Your Order Has Been Delivered</h2>
    <p style="color:rgba(255,255,255,0.6); font-size:14px; line-height:1.7;">Hi ${clientName}, your order for <strong>"${serviceTitle}"</strong> has been delivered. Please review and approve it.</p>
    ${btn('Review Order →', `${frontendUrl||'https://nexwork.vercel.app'}/my-orders`)}
  `),

  orderCompleted: ({ providerName, amount, frontendUrl }) => wrap(`
    <h2 style="color:#4ade80; font-size:20px; margin:0 0 12px;">🎉 Order Completed — Payment Released!</h2>
    <p style="color:rgba(255,255,255,0.6); font-size:14px; line-height:1.7;">Hi ${providerName}, the client approved your delivery. <strong style="color:${gold}">₹${amount}</strong> has been added to your available balance.</p>
    ${btn('View Earnings →', `${frontendUrl||'https://nexwork.vercel.app'}/earnings`)}
  `),

  newMessage: ({ receiverName, senderName, preview, frontendUrl }) => wrap(`
    <h2 style="color:#fff; font-size:20px; margin:0 0 12px;">💬 New Message</h2>
    <p style="color:rgba(255,255,255,0.6); font-size:14px; line-height:1.7;">Hi ${receiverName}, <strong style="color:${gold}">${senderName}</strong> sent you a message: <em>"${preview}"</em></p>
    ${btn('Reply Now →', `${frontendUrl||'https://nexwork.vercel.app'}/messages`)}
  `),

  jobApplication: ({ recruiterName, jobTitle, applicantName, frontendUrl }) => wrap(`
    <h2 style="color:#fff; font-size:20px; margin:0 0 12px;">📋 New Job Application</h2>
    <p style="color:rgba(255,255,255,0.6); font-size:14px; line-height:1.7;">Hi ${recruiterName}, <strong style="color:${gold}">${applicantName}</strong> applied for your job posting <strong>"${jobTitle}"</strong>.</p>
    ${btn('View Application →', `${frontendUrl||'https://nexwork.vercel.app'}/jobs`)}
  `),

  withdrawalRequested: ({ userName, amount, frontendUrl }) => wrap(`
    <h2 style="color:#fff; font-size:20px; margin:0 0 12px;">💸 Withdrawal Request Submitted</h2>
    <p style="color:rgba(255,255,255,0.6); font-size:14px; line-height:1.7;">Hi ${userName}, your withdrawal request for <strong style="color:${gold}">₹${amount}</strong> has been submitted. It will be processed within 24-48 hours.</p>
  `),
};
