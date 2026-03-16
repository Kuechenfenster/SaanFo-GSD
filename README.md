# SaanFo Map 🛒

Community-driven grocery deal finder for Hong Kong.

## About

SaanFo Map helps users discover grocery deals near them. Users can snap photos of deals they find in stores, and the app maps deals nearby while highlighting those matching user interests.

**Target Users:**
- Families (especially with helpers managing groceries)
- Bargain hunters
- International food enthusiasts hunting specific ingredients

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JS SPA
- **Security:** Helmet, Rate Limiting, Input Validation
- **Deployment:** Coolify + Docker

## Features

### Phase 1: Authentication (Complete)
- ✅ Phone number registration (+852 Hong Kong format)
- ✅ OTP verification (6-digit code)
- ✅ Optional email for newsletters
- ✅ GPS permission request
- ✅ Home/Work location presets

### Phase 2-6: Coming Soon
- Store registration with verification
- Deal upload with AI extraction
- Map-based deal discovery
- User interest-based highlighting

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/Kuechenfenster/SaanFo-GSD.git
cd SaanFo-GSD

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

## Environment Variables

Edit `.env` with your configuration:

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port (default: 8080) | No |
| NODE_ENV | development or production | No |
| FIREBASE_PROJECT_ID | Firebase project ID | No (mock mode) |
| FIREBASE_PRIVATE_KEY | Firebase private key | No (mock mode) |
| FIREBASE_CLIENT_EMAIL | Firebase client email | No (mock mode) |
| CORS_ORIGIN | Comma-separated allowed origins | No |
| RATE_LIMIT_MAX_REQUESTS | Requests per 15min | No |

## Running Locally

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at http://localhost:8080

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/phone` | POST | Request OTP |
| `/api/auth/verify-otp` | POST | Verify OTP |
| `/api/user/email` | POST | Save email |
| `/api/user/location-preset` | POST | Save location |
| `/api/user/profile` | GET | Get user profile |

## Deployment

### Coolify

1. Create a new resource in Coolify
2. Connect GitHub repository
3. Deploy - nixpacks will auto-detect Node.js

### Docker

```bash
docker build -t saanfo-map .
docker run -p 8080:8080 saanfo-map
```

## Development Mode

In development mode, OTPs are displayed in the console for testing:
```
[OTP] +85291234567: 123456
```

## Security Features

- Helmet security headers
- Rate limiting (100 req/15min)
- CORS configuration
- Input validation
- Request size limits (10kb)
- Error handling middleware

## Project Structure

```
SaanFo-GSD/
├── public/           # Frontend static files
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── server.js         # Express server
├── firebase-config.js # Firebase Admin SDK
├── package.json
├── nixpacks.toml
├── .env.example
└── .dockerignore
```

## License

MIT
