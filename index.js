require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const clientRoutes = require('./routes/clientRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageTemplateRoutes = require('./routes/messageTemplateRoutes');
const generalRoutes = require('./routes/generalRoutes');

const app = express();

// ✅ Required for trusting proxy (important on Vercel/HTTPS)
app.set('trust proxy', 1);

// ✅ CORS Setup
const allowedOrigins = ['https://tailorx-client.vercel.app', 'http://localhost:8080'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Session Setup with MongoStore (for Vercel)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: true,          // Only over HTTPS
    sameSite: 'none',      // Required for cross-site cookies
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  })
}));

app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ✅ Routes
app.get('/', (req, res) => {
  res.send('Hello from TailorX backend!');
});

app.use('/auth', authRoutes);
app.use('/user', profileRoutes);
app.use('/client', clientRoutes);
app.use('/order', orderRoutes);
app.use('/msgtemp', messageTemplateRoutes);
app.use('/general', generalRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});