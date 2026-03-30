# ClickZoom — Automate Your Content

> Drop a URL. Get a professional video walkthrough and annotated image guide automatically.

## Quick Start

```bash
# 1. Clone and setup
git clone <your-repo>
cd clickzoom
chmod +x scripts/setup.sh
./scripts/setup.sh

# 2. Fill in your environment variables
nano .env

# 3. Run in development
npm run dev
```

App runs at: http://localhost:3000  
API runs at: http://localhost:5000

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Redux Toolkit + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (free tier) |
| Cache / Queue | Redis + Bull |
| Browser Automation | Puppeteer |
| Video Generation | FFmpeg (fluent-ffmpeg) |
| Image Processing | Sharp |
| Voice Generation | Coqui TTS (self-hosted, free) |
| Subtitles | Whisper (self-hosted, free) |
| Translation | LibreTranslate (self-hosted, free) |
| Storage | Cloudflare R2 |
| Auth | JWT + Google OAuth 2.0 |
| Web3 | ethers.js + Rabby integration |

---

## Project Structure

```
clickzoom/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route pages
│       ├── store/          # Redux slices
│       ├── hooks/          # Custom React hooks
│       ├── services/       # API service layer
│       └── utils/          # Constants and helpers
├── server/                 # Express backend
│   ├── controllers/        # Request handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── middleware/         # Auth, rate limit, free tier checks
│   ├── services/           # Core business logic
│   │   ├── automation/     # Puppeteer capture + click detection
│   │   ├── video/          # FFmpeg video generation + zoom effects
│   │   ├── image/          # Sharp annotation + inset generation
│   │   ├── voice/          # Coqui TTS + Whisper subtitles
│   │   └── wallet/         # Web3 wallet + transaction limits
│   ├── config/             # DB, Redis, queue, storage, passport
│   └── utils/              # JWT, email, helpers
└── scripts/                # Setup and seed scripts
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `REDIS_URL` | Redis connection URL |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_PASS` | Gmail app password |
| `CLOUDFLARE_R2_*` | Cloudflare R2 storage credentials |
| `CLICKZOOM_WALLET_PRIVATE_KEY` | Platform wallet private key |

---

## Key Features

### Automatic Zoom Technology
Every click target is zoomed in at **2.5x** with:
- 0.5 second ease-in
- 1.5 second hold at zoomed view
- 0.5 second ease-out
- Animated Neon Mint pulsing ring around the target

### Free vs Pro Tier
- **Free**: Choose ONE output (video OR image) per tutorial. Locked after generation. Cannot regenerate.
- **Pro**: Both outputs simultaneously. Unlimited regeneration. Priority queue.

### Web3 Wallet
Internal platform wallet for automated DeFi tutorial capture:
- All EVM chains + Solana supported
- Strict spending limits enforced at middleware level
- Smart rule: executes only 1 real transaction per capture, adds overlay note for repeated steps
- Honeypot detection before any contract interaction

### Voice and Subtitles
- Coqui TTS: Male / Female / Neutral, 4 styles, 4 speeds, all world languages
- Whisper: Auto-generated subtitles synchronized with audio
- LibreTranslate: Optional secondary language translation

---

## Self-Hosted Services (Docker)

```bash
# Coqui TTS
docker run -p 5002:5002 ghcr.io/coqui-ai/tts

# Whisper (faster-whisper)
docker run -p 9000:9000 fedirz/faster-whisper-server:latest-cpu

# LibreTranslate
docker run -p 5003:5000 libretranslate/libretranslate
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel (free tier) |
| Backend | Railway.app or Render.com |
| Database | MongoDB Atlas (free 512MB) |
| Cache | Redis Cloud (free tier) |
| Storage | Cloudflare R2 (free 10GB/mo) |

---

## API Endpoints

Full API documentation in `docs/API.md`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/tutorials` | List tutorials |
| POST | `/api/tutorials` | Create tutorial |
| POST | `/api/tutorials/:id/generate` | Start generation |
| GET | `/api/content/:tutorialId` | Get generated content |
| GET | `/api/wallet/status` | Wallet status |

---

## Content Rules

No hyphens are used between words in any platform UI text including button labels, error messages, success messages, and all user-facing copy.

---

## License

MIT — ClickZoom 2026
