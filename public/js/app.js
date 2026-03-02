// SaanFo Map - NodeJS Version - Frontend App

// State management
const state = {
  userId: null,
  phoneNumber: null,
  verificationId: null,
  email: null,
  homeLocation: null,
  workLocation: null,
  currentLocation: null
};

// DOM Elements
const screens = {
  splash: document.getElementById('splash-screen'),
  phoneAuth: document.getElementById('phone-auth-screen'),
  otp: document.getElementById('otp-screen'),
  email: document.getElementById('email-screen'),
  locationPermission: document.getElementById('location-permission-screen'),
  locationPreset: document.getElementById('location-preset-screen'),
  mainApp: document.getElementById('main-app-screen')
};

// Helper Functions
function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function formatPhoneNumber(phone) {
  return phone.replace(/\s/g, '');
}

function isValidHKPhone(phone) {
  return /^\+852[0-9]{8}$/.test(phone);
}

// API Calls
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`/api${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Screen: Splash
function initSplash() {
  setTimeout(() => {
    showScreen('phoneAuth');
  }, 2000);
}

// Screen: Phone Auth
function initPhoneAuth() {
  const phoneInput = document.getElementById('phone-number');
  const sendBtn = document.getElementById('send-otp-btn');
  
  phoneInput.addEventListener('input', (e) => {
    const phone = formatPhoneNumber(e.target.value);
    sendBtn.disabled = phone.length < 8;
  });
  
  sendBtn.addEventListener('click', async () => {
    const phone = '+852' + formatPhoneNumber(phoneInput.value);
    
    if (!isValidHKPhone(phone)) {
      showToast('Please enter a valid HK phone number', 'error');
      return;
    }
    
    try {
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';
      
      const result = await apiCall('/auth/phone', 'POST', { phoneNumber: phone });
      
      state.phoneNumber = phone;
      state.verificationId = result.verificationId;
      
      if (result.otp) {
        console.log('Development OTP:', result.otp);
      }
      
      document.getElementById('otp-phone').textContent = phone;
      showScreen('otp');
      showToast('Verification code sent!', 'success');
      
      // Focus first OTP input
      document.querySelector('.otp-digit').focus();
    } catch (error) {
      showToast(error.message || 'Failed to send OTP', 'error');
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send Verification Code';
    }
  });
}

// Screen: OTP
function initOtp() {
  const otpInputs = document.querySelectorAll('.otp-digit');
  const verifyBtn = document.getElementById('verify-otp-btn');
  
  // Handle OTP input
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      
      if (value.length === 1) {
        // Move to next input
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      }
      
      // Check if all filled
      const otp = Array.from(otpInputs).map(i => i.value).join('');
      verifyBtn.disabled = otp.length !== 6;
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });
  
  verifyBtn.addEventListener('click', async () => {
    const otp = Array.from(otpInputs).map(i => i.value).join('');
    
    if (otp.length !== 6) {
      showToast('Please enter all 6 digits', 'error');
      return;
    }
    
    try {
      verifyBtn.disabled = true;
      verifyBtn.textContent = 'Verifying...';
      
      const result = await apiCall('/auth/verify-otp', 'POST', {
        verificationId: state.verificationId,
        otp,
        phoneNumber: state.phoneNumber
      });
      
      state.userId = result.userId;
      showScreen('email');
      showToast('Phone verified!', 'success');
    } catch (error) {
      showToast(error.message || 'Invalid OTP', 'error');
    } finally {
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify';
    }
  });
  
  // Resend OTP
  document.getElementById('resend-otp').addEventListener('click', async () => {
    try {
      const result = await apiCall('/auth/phone', 'POST', { phoneNumber: state.phoneNumber });
      state.verificationId = result.verificationId;
      
      if (result.otp) {
        console.log('New Development OTP:', result.otp);
      }
      
      // Clear inputs
      otpInputs.forEach(input => input.value = '');
      otpInputs[0].focus();
      verifyBtn.disabled = true;
      
      showToast('New code sent!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to resend', 'error');
    }
  });
}

// Screen: Email
function initEmail() {
  const emailInput = document.getElementById('email');
  const saveBtn = document.getElementById('save-email-btn');
  const skipBtn = document.getElementById('skip-email-btn');
  
  saveBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    
    if (email && !email.includes('@')) {
      showToast('Please enter a valid email', 'error');
      return;
    }
    
    try {
      await apiCall('/user/email', 'POST', { userId: state.userId, email });
      state.email = email;
      showScreen('locationPermission');
    } catch (error) {
      showToast(error.message || 'Failed to save email', 'error');
    }
  });
  
  skipBtn.addEventListener('click', async () => {
    try {
      await apiCall('/user/email', 'POST', { userId: state.userId, email: null });
      showScreen('locationPermission');
    } catch (error) {
      showToast(error.message || 'Failed to skip', 'error');
    }
  });
}

// Screen: Location Permission
function initLocationPermission() {
  const allowBtn = document.getElementById('allow-location-btn');
  
  allowBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported', 'error');
      showScreen('locationPreset');
      return;
    }
    
    allowBtn.disabled = true;
    allowBtn.textContent = 'Getting location...';
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        showToast('Location access granted!', 'success');
        showScreen('locationPreset');
        updateLocationPresets();
      },
      (error) => {
        console.error('Location error:', error);
        showToast('Could not get location. Please set manually.', 'error');
        showScreen('locationPreset');
      }
    );
  });
}

// Screen: Location Presets
function updateLocationPresets() {
  const homeStatus = document.getElementById('home-status');
  const workStatus = document.getElementById('work-status');
  
  if (state.homeLocation) {
    homeStatus.textContent = `${state.homeLocation.latitude.toFixed(4)}, ${state.homeLocation.longitude.toFixed(4)}`;
    homeStatus.classList.add('set');
  }
  
  if (state.workLocation) {
    workStatus.textContent = `${state.workLocation.latitude.toFixed(4)}, ${state.workLocation.longitude.toFixed(4)}`;
    workStatus.classList.add('set');
  }
}

function initLocationPreset() {
  document.getElementById('set-home-btn').addEventListener('click', async () => {
    const location = state.currentLocation || await getCurrentLocation();
    if (location) {
      state.homeLocation = location;
      try {
        await apiCall('/user/location-preset', 'POST', {
          userId: state.userId,
          type: 'home',
          ...location
        });
        updateLocationPresets();
        showToast('Home location saved!', 'success');
      } catch (error) {
        showToast(error.message || 'Failed to save location', 'error');
      }
    }
  });
  
  document.getElementById('set-work-btn').addEventListener('click', async () => {
    const location = state.currentLocation || await getCurrentLocation();
    if (location) {
      state.workLocation = location;
      try {
        await apiCall('/user/location-preset', 'POST', {
          userId: state.userId,
          type: 'work',
          ...location
        });
        updateLocationPresets();
        showToast('Work location saved!', 'success');
      } catch (error) {
        showToast(error.message || 'Failed to save location', 'error');
      }
    }
  });
  
  document.getElementById('finish-setup-btn').addEventListener('click', () => {
    showScreen('mainApp');
    showToast('Welcome to SaanFo Map!', 'success');
  });
}

function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      showToast('Geolocation not available', 'error');
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        showToast('Could not get location', 'error');
        resolve(null);
      }
    );
  });
}

// Screen: Main App
function initMainApp() {
  document.getElementById('logout-btn').addEventListener('click', () => {
    // Reset state
    state.userId = null;
    state.phoneNumber = null;
    state.verificationId = null;
    state.email = null;
    state.homeLocation = null;
    state.workLocation = null;
    state.currentLocation = null;
    
    // Clear inputs
    document.getElementById('phone-number').value = '';
    document.getElementById('email').value = '';
    document.querySelectorAll('.otp-digit').forEach(input => input.value = '');
    
    showScreen('phoneAuth');
    showToast('Logged out successfully', 'success');
  });
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log('🛒 SaanFo Map initialized');
  
  initSplash();
  initPhoneAuth();
  initOtp();
  initEmail();
  initLocationPermission();
  initLocationPreset();
  initMainApp();
});
