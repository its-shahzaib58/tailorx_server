require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes'); // <-- Import your routes
const profileRoutes = require('./routes/profileRoutes'); // <-- Import your routes
const clientRoutes = require('./routes/clientRoutes'); // <-- Import your routes
const orderRoutes = require('./routes/orderRoutes'); // <-- Import your routes
const messageTemplateRoutes = require('./routes/messageTemplateRoutes'); // <-- Import your routes
const generalRoutes = require('./routes/generalRoutes'); // <-- Import your routes

const app = express();

const corsOptions = {
  origin:"*",
  credentials:true
}

app.use(cors(corsOptions));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Vercel uses HTTPS
      sameSite: 'none'
    }
}));

app.use(express.json());
// Run middleware
// function runMiddleware(req, res, fn) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, result => {
//       if (result instanceof Error) {
//         return reject(result)
//       }
//       return resolve(result)
//     })
//   });
// }

// export default async function handler(req, res) {
//   await runMiddleware(req, res, cors);
//   // your logic
//   res.json({ user: 'Shahzaib' });
// }
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('Hello from Node.js + MongoDB!');
});

// Use the auth routes
app.use('/auth', authRoutes); // All auth routes will be prefixed with /api

// Use the profile routes 
app.use('/user', profileRoutes);

// Use the client routes 
app.use('/client', clientRoutes);

// Use the order routes 
app.use('/order', orderRoutes);

// Use the order routes 
app.use('/msgtemp', messageTemplateRoutes);
// Use the /dashboard routes 
app.use('/general', generalRoutes);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

