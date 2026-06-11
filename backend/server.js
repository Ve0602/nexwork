const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Starting NexWork server...');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET ❌');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET ❌');

const app = express();
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/services', require('./routes/services'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/jobs',     require('./routes/jobs'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/ai',       require('./routes/ai'));

app.get('/', (req, res) => res.json({ status: 'NexWork API running ✅' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 })
  .then(async () => {
    console.log('✅ MongoDB connected!');
    try { await require('./utils/seed')(); console.log('✅ Seed done'); }
    catch (e) { console.error('⚠️ Seed error:', e.message); }
  })
  .catch(err => console.error('❌ MongoDB failed:', err.message));
