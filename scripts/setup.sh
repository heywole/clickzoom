#!/bin/bash
set -e

echo "⚡ Setting up ClickZoom..."

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required. Install from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v)"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📄 Created .env from .env.example — please fill in your values"
else
  echo "✅ .env exists"
fi

# Install dependencies
echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Create required upload directories
mkdir -p server/uploads/temp server/uploads/output server/uploads/audio server/uploads/subtitles

echo ""
echo "✅ ClickZoom setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your MongoDB, Redis, Google OAuth, and Cloudflare R2 credentials"
echo "  2. Run: npm run dev"
echo "  3. Open http://localhost:3000"
echo ""
echo "Optional self-hosted services:"
echo "  - Coqui TTS on port 5002  (voice generation)"
echo "  - Whisper on port 9000    (subtitle generation)"
echo "  - LibreTranslate on port 5003 (translation)"
