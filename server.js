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
 * - PostgreSQL database (Coolify-compatible)
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Database configuration
const { sequelize, User, OTP } = require('./db/models');

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
// DATABASE HELPERS
// ============================================

// Find user by session token
const findUserBySession = async (sessionToken) => {
  if (!sessionToken) return null;
  return await User.findOne({ where: { sessionToken } });
};

// Find or create user
const findOrCreateUser = async (phoneNumber) => {
  const [user] = await User.findOrCreate({
    where: { phoneNumber },
    defaults: {
      phoneNumber,
      interests: []
    }
  });
  return user;
};

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error: ' + err.message;
  }
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    firebase: isConfigured ? 'configured' : 'mock-mode'
  });
});

// Phone auth - request OTP
app.post('/api/auth/phone', async (req, res, next) => {
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
    
    // Check for existing user or create new
    await findOrCreateUser(formattedPhone);
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationId = `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store OTP in database with 5-minute expiration
    await OTP.create({
      phoneNumber: formattedPhone,
      otp: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
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
app.post('/api/auth/verify-otp', async (req, res, next) => {
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
    
    // Find the most recent unverified OTP for this verificationId
    // Note: We use phoneNumber extracted from a previous step or match by recent OTP
    // For simplicity, we'll find the latest valid OTP
    const otpRecord = await OTP.findOne({
      where: {
        otp: otp,
        verified: false
      },
      order: [['createdAt', 'DESC']]
    });
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }
    
    const verification = otpRecord;
    
    // Check expiration
    if (new Date() > verification.expiresAt) {
      await OTP.update({ verified: true }, { where: { id: verification.id } });
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }
    
    // Check attempts
    if (verification.attempts >= 5) {
      await OTP.update({ verified: true }, { where: { id: verification.id } });
      return res.status(400).json({
        success: false,
        error: 'Too many attempts. Please request a new OTP.'
      });
    }
    
    // Verify OTP
    if (verification.otp !== otp) {
      await OTP.update(
        { attempts: verification.attempts + 1 },
        { where: { id: verification.id } }
      );
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP',
        attemptsRemaining: 5 - verification.attempts - 1
      });
    }
    
    // Success - mark OTP as verified and get user
    await OTP.update({ verified: true }, { where: { id: verification.id } });
    const user = await User.findOne({ where: { phoneNumber: verification.phoneNumber } });
    
    // Generate session token (in production, use JWT)
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    
    // Store session in database
    await User.update(
      { sessionToken, verifiedAt: new Date() },
      { where: { phoneNumber: verification.phoneNumber } }
    );
    
    res.json({
      success: true,
      message: 'Verification successful',
      sessionToken: sessionToken,
      user: {
        phoneNumber: user.phoneNumber,
        email: user.email,
        hasHomeLocation: !!(user.homeLatitude && user.homeLongitude),
        hasWorkLocation: !!(user.workLatitude && user.workLongitude)
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Save email (optional)
app.post('/api/user/email', async (req, res, next) => {
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
    const user = await findUserBySession(sessionToken);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }
    
    // Update email
    await User.update(
      { email: email || null },
      { where: { id: user.id } }
    );
    
    res.json({
      success: true,
      message: email ? 'Email saved successfully' : 'Email removed',
      email: email || null
    });
    
  } catch (error) {
    next(error);
  }
});

// Save location preset
app.post('/api/user/location-preset', async (req, res, next) => {
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
    const user = await findUserBySession(sessionToken);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }
    
    // Update location
    const updateData = {};
    if (presetType === 'home') {
      updateData.homeLatitude = location.latitude;
      updateData.homeLongitude = location.longitude;
    } else {
      updateData.workLatitude = location.latitude;
      updateData.workLongitude = location.longitude;
    }
    
    await User.update(updateData, { where: { id: user.id } });
    
    res.json({
      success: true,
      message: `${presetType.charAt(0).toUpperCase() + presetType.slice(1)} location saved`,
      [presetType + 'Location']: location
    });
    
  } catch (error) {
    next(error);
  }
});

// Get user profile
app.get('/api/user/profile', async (req, res, next) => {
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
    const user = await findUserBySession(sessionToken);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }
    
    res.json({
      success: true,
      user: {
        phoneNumber: user.phoneNumber,
        email: user.email,
        homeLocation: user.homeLatitude && user.homeLongitude ? {
          latitude: user.homeLatitude,
          longitude: user.homeLongitude
        } : null,
        workLocation: user.workLatitude && user.workLongitude ? {
          latitude: user.workLatitude,
          longitude: user.workLongitude
        } : null,
        interests: user.interests,
        createdAt: user.createdAt,
        verifiedAt: user.verifiedAt
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

const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (err) {
    console.error('Error closing database:', err);
  }
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync models (creates tables if they don't exist)
    // Use { force: true } to drop and recreate tables (development only)
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`\n🛒 SaanFo Map Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔥 Firebase: ${isConfigured ? '✅ Configured' : '⚠️  Mock Mode'}`);
      console.log(`🛡️  Rate Limiting: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} req/15min\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
