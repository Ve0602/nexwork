const router = require('express').Router();
const { auth } = require('../middleware/auth');
const axios = require('axios');

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

const askClaude = async (systemPrompt, userMessage, maxTokens = 1000) => {
  const response = await axios.post(CLAUDE_API, {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }]
  }, {
    headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' }
  });
  return response.data.content[0].text;
};

// AI Career Coach
router.post('/career-coach', auth, async (req, res) => {
  try {
    const { question, userProfile } = req.body;
    const system = `You are an expert AI Career Coach specializing in the Indian job market, freelancing, and AI/tech careers. The user is ${userProfile?.name || 'a professional'} with skills: ${(userProfile?.skills||[]).map(s=>s.name).join(', ')}. Give practical, actionable advice.`;
    const answer = await askClaude(system, question);
    res.json({ answer });
  } catch (e) { res.status(500).json({ message: 'AI service unavailable', error: e.message }); }
});

// AI Resume Builder
router.post('/resume-builder', auth, async (req, res) => {
  try {
    const { userProfile, jobTitle } = req.body;
    const system = 'You are an expert resume writer. Create a professional, ATS-optimized resume in JSON format with sections: summary, experience, skills, education, certifications. Return ONLY valid JSON.';
    const prompt = `Create a professional resume for ${userProfile.name}, targeting ${jobTitle || 'AI/Data Science roles'}. Skills: ${(userProfile.skills||[]).map(s=>s.name).join(', ')}. Experience: ${JSON.stringify(userProfile.experience||[])}`;
    const result = await askClaude(system, prompt, 2000);
    let resume;
    try { resume = JSON.parse(result); } catch { resume = { raw: result }; }
    res.json({ resume });
  } catch (e) { res.status(500).json({ message: 'AI service unavailable', error: e.message }); }
});

// AI Skill Analyzer
router.post('/skill-analyzer', auth, async (req, res) => {
  try {
    const { skills, targetRole } = req.body;
    const system = 'You are an AI skill analyzer. Analyze skills and return JSON with: score (0-100), strengths, gaps, recommendations, roadmap (array of steps). Return ONLY valid JSON.';
    const prompt = `Analyze these skills for a ${targetRole}: ${skills.join(', ')}`;
    const result = await askClaude(system, prompt);
    let analysis;
    try { analysis = JSON.parse(result); } catch { analysis = { raw: result }; }
    res.json({ analysis });
  } catch (e) { res.status(500).json({ message: 'AI service unavailable', error: e.message }); }
});

// AI Interview Coach
router.post('/interview-coach', auth, async (req, res) => {
  try {
    const { role, question, userAnswer, interviewType = 'technical' } = req.body;
    const system = `You are an expert ${interviewType} interview coach. Evaluate the answer and provide: score (0-10), feedback, ideal_answer, tips. Return JSON only.`;
    const prompt = `Role: ${role}\nQuestion: ${question}\nCandidate Answer: ${userAnswer}`;
    const result = await askClaude(system, prompt);
    let feedback;
    try { feedback = JSON.parse(result); } catch { feedback = { raw: result }; }
    res.json({ feedback });
  } catch (e) { res.status(500).json({ message: 'AI service unavailable', error: e.message }); }
});

// AI Project Matcher
router.post('/match-projects', auth, async (req, res) => {
  try {
    const { userSkills, projects } = req.body;
    const system = 'You are an AI talent matcher. Score each project match (0-100) and explain why. Return JSON array with id, score, reason for each project.';
    const prompt = `User skills: ${userSkills.join(', ')}\nProjects: ${JSON.stringify(projects.map(p=>({id:p._id,title:p.title,skills:p.skills})))}`;
    const result = await askClaude(system, prompt);
    let matches;
    try { matches = JSON.parse(result); } catch { matches = []; }
    res.json({ matches });
  } catch (e) { res.status(500).json({ message: 'AI service unavailable', error: e.message }); }
});

// AI Proposal Writer
router.post('/write-proposal', auth, async (req, res) => {
  try {
    const { project, freelancerProfile } = req.body;
    const system = 'You are an expert freelance proposal writer. Write a compelling, personalized proposal that wins projects. Be concise, professional, and highlight relevant experience.';
    const prompt = `Write a proposal for this project:\nTitle: ${project.title}\nDescription: ${project.description}\nRequired Skills: ${project.skills?.join(', ')}\n\nFreelancer Profile:\nName: ${freelancerProfile.name}\nSkills: ${(freelancerProfile.skills||[]).map(s=>s.name).join(', ')}\nHeadline: ${freelancerProfile.headline}`;
    const proposal = await askClaude(system, prompt);
    res.json({ proposal });
  } catch (e) { res.status(500).json({ message: 'AI service unavailable', error: e.message }); }
});

module.exports = router;
