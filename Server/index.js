require('dotenv').config(); // Ensure you have the dotenv package installed 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('./models/User'); // Import your User model

const app = express();
const PORT = process.env.PORT || 3000; // Use environment port

// Middleware
app.use(express.json());


const allowedOrigins = [
  'http://localhost:5173', // Local development
  'https://frontend-kyicmrdpy-raahimabdul30-gmailcoms-projects.vercel.app' // Vercel deployed frontend
]
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// MongoDB Connection String (use environment variable for secure storage)
const uri = process.env.MONGO_URI;
mongoose
  .connect(uri)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Configure nodemailer for sending emails using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// In-memory OTP store
const otpStore = new Map();

// Registration API
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, Email, and Password are required!' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully! Please login to receive OTP.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering the user', error: error.message });
  }
});

// Login API with OTP generation
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required!' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const otp = crypto.randomInt(100000, 999999);

    otpStore.set(email, { otp, expires: Date.now() + 300000 });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Login',
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('Error sending OTP:', err);
        return res.status(500).json({ message: 'Failed to send OTP', error: err.message });
      }

      console.log('OTP sent:', info.response);
      res.status(200).json({ message: 'OTP sent to your email!' });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// OTP Verification API
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required!' });
  }

  const otpData = otpStore.get(email);

  if (!otpData) {
    return res.status(400).json({ message: 'OTP not found or expired' });
  }

  if (parseInt(otp) === otpData.otp) {
    otpStore.delete(email);
    res.json({ message: 'OTP verified successfully!' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


