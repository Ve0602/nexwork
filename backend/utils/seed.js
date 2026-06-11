const NexUser = require('../models/NexUser');

module.exports = async function seed() {
  const adminExists = await NexUser.findOne({ roles: 'admin' });
  if (!adminExists) {
    await NexUser.create({
      name: 'Ramana Vemunoori',
      email: process.env.ADMIN_EMAIL || 'vemunooriramana0602@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@2026',
      roles: ['admin','freelancer','service_provider'],
      primaryRole: 'admin',
      isVerified: true,
      headline: 'AI Engineer & Founder of NexWork',
      bio: 'AI prompt engineer, full stack developer, and founder of NexWork platform.',
      skills: [
        { name: 'Prompt Engineering', level: 'Expert', verified: true },
        { name: 'Python', level: 'Advanced', verified: true },
        { name: 'React', level: 'Advanced', verified: true },
        { name: 'Data Annotation', level: 'Expert', verified: true },
        { name: 'Machine Learning', level: 'Intermediate', verified: false },
      ],
      city: 'Warangal', state: 'Telangana', country: 'India',
      hourlyRate: 500,
      availability: 'available',
      linkedinUrl: 'https://www.linkedin.com/in/vemunoori-ramana-41b86b198',
      githubUrl: 'https://github.com/Ve0602',
    });
    console.log('✅ Admin user created');
  }
};
