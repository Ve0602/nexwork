const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const nexUserSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, default: null },
  phone:        { type: String, default: '' },
  photo:        { type: String, default: '' },
  coverPhoto:   { type: String, default: '' },
  googleId:     { type: String, default: null },
  githubId:     { type: String, default: null },
  facebookId:   { type: String, default: null },
  authProvider: { type: String, enum: ['local','google','github','facebook','phone'], default: 'local' },
  isVerified:   { type: Boolean, default: false },
  emailVerified:{ type: Boolean, default: false },
  emailVerificationToken:   { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
  isActive:     { type: Boolean, default: true },
  roles:        [{ type: String, enum: ['student','freelancer','jobseeker','professional','mentor','trainer','service_provider','client','enterprise','recruiter','admin'] }],
  primaryRole:  { type: String, default: 'freelancer' },
  headline:     { type: String, default: '' },
  bio:          { type: String, default: '' },
  location:     { type: String, default: '' },
  city:         { type: String, default: '' },
  state:        { type: String, default: '' },
  country:      { type: String, default: 'India' },
  language:     { type: String, default: 'en' },
  skills:       [{ name: String, level: String, verified: Boolean }],
  experience:   [{ title: String, company: String, from: Date, to: Date, current: Boolean, desc: String }],
  education:    [{ degree: String, institution: String, year: Number, grade: String }],
  certifications: [{ name: String, issuer: String, year: Number, url: String }],
  portfolio:    [{ title: String, desc: String, url: String, image: String, tags: [String] }],
  hourlyRate:   { type: Number, default: 0 },
  availability: { type: String, enum: ['available','busy','unavailable'], default: 'available' },
  totalEarned:  { type: Number, default: 0 },
  totalJobs:    { type: Number, default: 0 },
  rating:       { type: Number, default: 0 },
  reviewCount:  { type: Number, default: 0 },
  plan:         { type: String, enum: ['free','basic','pro','enterprise'], default: 'free' },
  planExpiry:   { type: Date, default: null },
  linkedinUrl:  { type: String, default: '' },
  githubUrl:    { type: String, default: '' },
  websiteUrl:   { type: String, default: '' },
  emailNotifs:  { type: Boolean, default: true },
  createdAt:    { type: Date, default: Date.now },
  lastLogin:    { type: Date },
  updatedAt:    { type: Date, default: Date.now }
});

nexUserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
nexUserSchema.methods.comparePassword = async function(c) {
  if (!this.password) return false;
  return require('bcryptjs').compare(c, this.password);
};
module.exports = mongoose.model('NexUser', nexUserSchema);
