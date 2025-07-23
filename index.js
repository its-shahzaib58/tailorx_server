require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const clientRoutes = require('./routes/clientRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageTemplateRoutes = require('./routes/messageTemplateRoutes');
const generalRoutes = require('./routes/generalRoutes');

const app = express();

// ✅ For trusting Vercel proxy
app.set('trust proxy', 1);

// ✅ Allow specific origins only
const allowedOrigins = ['https://tailorx-client.vercel.app', 'http://localhost:8080'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Session setup (in-memory)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: true,         // required for HTTPS (Vercel)
    sameSite: 'none',     // cross-origin cookie support
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  }
}));

app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ✅ Test route
app.get('/', (req, res) => {
  res.send('TailorX backend running ✅');
});

// ✅ Mount routes
app.use('/auth', authRoutes);
app.use('/user', profileRoutes);
app.use('/client', clientRoutes);
app.use('/order', orderRoutes);
app.use('/msgtemp', messageTemplateRoutes);
app.use('/general', generalRoutes);

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
