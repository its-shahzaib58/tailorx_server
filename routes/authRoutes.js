require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  const { b_name, name, email, phone_no, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ b_name, name, email, phone_no, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  req.session.userId = user._id;
  res.json({ message: 'Login successful', user: { name: user.name, email: user.email } });
});

// Check session
router.get('/me', (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

// Logout Route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});



// Route: Reset password when logged in
router.post("/change-password", async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { newPassword } = req.body;

  const user = await User.findById(userId);
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password updated successfully" });
});




//   1. Forgot password route:


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // 1. Check if user exists
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // 2. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

  // 3. Save OTP & expiry in DB
  user.resetOtp = otp;
  user.resetOtpExpiry = Date.now() + 1000 * 60 * 10; // 10 mins
  await user.save();

  // 4. Create Gmail transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_APP_PASS, // App password
    }
  });

  // 5. Email content
  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: 'Your Password Reset OTP',
    html: `
      <h2>Reset Your Password</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Try again later.' });
  }
});

// Only verify OTP – do NOT reset password here
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  
  if (!user || user.resetOtp !== otp) {
    return res.status(400).json({ message: "Invalid OTP or user not found" });
  }

  if (Date.now() > user.resetOtpExpiry) {
    return res.status(400).json({ message: "OTP expired" });
  }
  // ✅ Create a temporary session for password reset
  req.session.resetEmail = email;
  res.json({ success: true, message: "OTP verified successfully" });
});


//   3. Reset password using token:

router.post('/reset-password', async (req, res) => {
  const { newPassword } = req.body;

  const email = req.session.resetEmail; // ✅ Get from session

  if (!email) {
    return res.status(403).json({ message: "Unauthorized. Please verify OTP first." });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  // Clear OTP and reset session
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  // ✅ Destroy the reset session
  req.session.resetEmail = null;

  res.json({ message: "Password reset successful" });
});



module.exports = router;
