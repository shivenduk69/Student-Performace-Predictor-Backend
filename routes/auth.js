const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Mentor = require('../models/Mentor');

const router = express.Router();

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const mentor = await Mentor.findOne({ email });
    if (!mentor) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, mentor.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: mentor._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const mentor = await Mentor.findOne({ email });
    if (!mentor) return res.status(400).json({ message: 'Email not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mentor.otp = otp;
    mentor.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await mentor.save();

    // Simulate sending email
    console.log(`OTP for ${email}: ${otp}`);

    // Uncomment below for actual email sending
    // const transporter = nodemailer.createTransporter({
    //   service: 'gmail',
    //   auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }
    // });
    // await transporter.sendMail({
    //   from: process.env.EMAIL,
    //   to: email,
    //   subject: 'Password Reset OTP',
    //   text: `Your OTP is ${otp}`
    // });

    res.json({ message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const mentor = await Mentor.findOne({ email });
    if (!mentor || mentor.otp !== otp || mentor.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /reset-password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const mentor = await Mentor.findOne({ email });
    if (!mentor || mentor.otp !== otp || mentor.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    mentor.password = await bcrypt.hash(newPassword, salt);
    mentor.otp = undefined;
    mentor.otpExpires = undefined;
    await mentor.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;