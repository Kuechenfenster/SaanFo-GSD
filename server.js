const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Phone auth - request OTP
app.post('/api/auth/phone', (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber || !phoneNumber.match(/^\+852[0-9]{8}$/)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid Hong Kong phone number format. Use +852 followed by 8 digits.' 
    });
  }
  
  // Generate mock OTP for demo (in production, use Firebase Auth)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  console.log(`OTP for ${phoneNumber}: ${otp}`);
  
  res.json({ 
    success: true, 
    message: 'OTP sent successfully',
    verificationId: `ver_${Date.now()}`,
    // Only include OTP in development!
    ...(process.env.NODE_ENV !== 'production' && { otp })
  });
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { verificationId, otp, phoneNumber } = req.body;
  
  if (!otp || otp.length !== 6) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid OTP format. Must be 6 digits.' 
    });
  }
  
  // Mock verification (in production, verify with Firebase)
  res.json({ 
    success: true, 
    message: 'Phone verified successfully',
    userId: `user_${Date.now()}`,
    phoneNumber
  });
});

// Save email
app.post('/api/user/email', (req, res) => {
  const { userId, email } = req.body;
  
  if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid email format.' 
    });
  }
  
  res.json({ 
    success: true, 
    message: email ? 'Email saved successfully' : 'Email skipped',
    email: email || null
  });
});

// Save location preset
app.post('/api/user/location-preset', (req, res) => {
  const { userId, type, latitude, longitude } = req.body;
  
  if (!['home', 'work'].includes(type)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid location type. Must be "home" or "work".' 
    });
  }
  
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ 
      success: false, 
      error: 'Latitude and longitude are required.' 
    });
  }
  
  res.json({ 
    success: true, 
    message: `${type.charAt(0).toUpperCase() + type.slice(1)} location saved`,
    type,
    latitude,
    longitude
  });
});

// Catch all - serve index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SaanFo Map server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});
