/**
 * SaanFo Map - Express Server
 * Community-driven grocery deal finder app
 * 
 * Security Features:
 * - Helmet for security headers
 * - Rate limiting
 * - Input validation
 * - Error handling middleware
 * - Firebase Admin SDK integration
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Firebase configuration
const { admin, isConfigured } = require('./firebase-config');

const app = express();
const PORT = process.env.PORT || 8080;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self", "https://*"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Request logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

// Validate phone number format (HK: +852 followed by 8 digits)
const validatePhoneNumber = (phone) => {
  return /^\+852[0-9]{8}$/.test(phone);
};

// Validate email format
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate location data
const validateLocation = (location) => {
  return location && 
    typeof location.latitude === 'number' && 
    typeof location.longitude === 'number' &&
    location.latitude >= -90 && location.latitude <= 90 &&
    location.longitude >= -180 && location.longitude <= 180;
};

// ============================================
// IN-MEMORY STORAGE (Replace with database in production)
// ============================================

const userStore = new Map(); // phoneNumber -> user data
const otpStore = new Map();  // verificationId -> { phoneNumber, otp, expiresAt }

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    firebase: isConfigured ? 'configured' : 'mock-mode'
  });
});

// Phone auth - request OTP
app.post('/api/auth/phone', (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    
    // Input validation
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    // Format phone number (remove spaces, ensure +852 prefix)
    let formattedPhone = phoneNumber.replace(/\s/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+852' + formattedPhone;
    }
    
    if (!validatePhoneNumber(formattedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Hong Kong phone number. Use +852 followed by 8 digits.'
      });
    }
    
    // Check for existing user
    if (!userStore.has(formattedPhone)) {
      userStore.set(formattedPhone, {
        phoneNumber: formattedPhone,
        createdAt: new Date().toISOString(),
        email: null,
        homeLocation: null,
        workLocation: null
      });
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationId = `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store OTP with 5-minute expiration
    otpStore.set(verificationId, {
      phoneNumber: formattedPhone,
      otp: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });
    
    console.log(`[OTP] ${formattedPhone}: ${otp}`);
    
    // In production, you would send SMS here via Firebase or other SMS service
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      verificationId: verificationId,
      // Remove this in production!
      ...(process.env.NODE_ENV !== 'production' && { otp: otp })
    });
    
  } catch (error) {
    next(error);
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res, next) => {
  try {
    const { verificationId, otp } = req.body;
    
    // Input validation
    if (!verificationId || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Verification ID and OTP are required'
      });
    }
    
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: 'OTP must be 6 digits'
      });
    }
    
    // Find verification record
    const verification = otpStore.get(verificationId);
    
    if (!verification) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification ID'
      });
    }
    
    // Check expiration
    if (Date.now() > verification.expiresAt) {
      otpStore.delete(verificationId);
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }
    
    // Check attempts
    verification.attempts++;
    if (verification.attempts > 5) {
      otpStore.delete(verificationId);
      return res.status(400).json({
        success: false,
        error: 'Too many attempts. Please request a new OTP.'
      });
    }
    
    // Verify OTP
    if (verification.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP',
        attemptsRemaining: 5 - verification.attempts
      });
    }
    
    // Success - delete OTP and get user
    otpStore.delete(verificationId);
    const user = userStore.get(verification.phoneNumber);
    
    // Generate session token (in production, use JWT)
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    
    // Store session
    userStore.set(verification.phoneNumber, {
      ...user,
      sessionToken: sessionToken,
      verifiedAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Verification successful',
      sessionToken: sessionToken,
      user: {
        phoneNumber: user.phoneNumber,
        email: user.email,
        hasHomeLocation: !!user.homeLocation,
        hasWorkLocation: !!user.workLocation
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Save email (optional)
app.post('/api/user/email', (req, res, next) => {
  try {
    const { sessionToken, email } = req.body;
    
    // Input validation
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Find user by session token
    let foundUser = null;
    for (const [phone, user] of userStore) {
      if (user.sessionToken === sessionToken) {
        foundUser = user;
        break;
      }
    }
    
    if (!foundUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }
    
    // Update email
    foundUser.email = email || null;
    userStore.set(foundUser.phoneNumber, foundUser);
    
    res.json({
      success: true,
      message: email ? 'Email saved successfully' : 'Email removed',
      email: foundUser.email
    });
    
  } catch (error) {
    next(error);
  }
});

// Save location preset
app.post('/api/user/location-preset', (req, res, next) => {
  try {
    const { sessionToken, presetType, location } = req.body;
    
    // Input validation
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!['home', 'work'].includes(presetType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid preset type. Use "home" or "work"'
      });
    }
    
    if (!validateLocation(location)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location data. Requires latitude and longitude (numbers between -90/90 and -180/180)'
      });
    }
    
    // Find user by session token
    let foundUser = null;
    for (const [phone, user] of userStore) {
      if (user.sessionToken === sessionToken) {
        foundUser = user;
        break;
      }
    }
    
    if (!foundUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }
    
    // Update location
    const updateKey = `${presetType}Location`;
    foundUser[updateKey] = location;
    userStore.set(foundUser.phoneNumber, foundUser);
    
    res.json({
      success: true,
      message: `${presetType.charAt(0).toUpperCase() + presetType.slice(1)} location saved`,
      [updateKey]: location
    });
    
  } catch (error) {
    next(error);
  }
});

// Get user profile
app.get('/api/user/profile', (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Find user by session token
    let foundUser = null;
    for (const [phone, user] of userStore) {
      if (user.sessionToken === sessionToken) {
        foundUser = user;
        break;
      }
    }
    
    if (!foundUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }
    
    res.json({
      success: true,
      user: {
        phoneNumber: foundUser.phoneNumber,
        email: foundUser.email,
        homeLocation: foundUser.homeLocation,
        workLocation: foundUser.workLocation,
        createdAt: foundUser.createdAt,
        verifiedAt: foundUser.verifiedAt
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// ============================================
// FRONTEND ROUTES
// ============================================

// Serve SPA for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    error: message
  });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = () => {
  console.log('\n🛑 Shutting down gracefully...');
  // Clean up resources here
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n🛒 SaanFo Map Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase: ${isConfigured ? '✅ Configured' : '⚠️  Mock Mode'}`);
  console.log(`🛡️  Rate Limiting: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} req/15min\n`);
});

module.exports = app;
