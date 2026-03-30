#!/bin/bash
echo "🔧 Installing all server dependencies..."
cd "$(dirname "$0")/../server"
npm install cookie-parser express-session @sentry/node winston uuid \
  @aws-sdk/client-s3 @aws-sdk/s3-request-presigner \
  bcrypt bull connect-redis cors dotenv ethers \
  express express-rate-limit express-validator \
  fluent-ffmpeg helmet jsonwebtoken mongoose \
  multer nodemailer passport passport-google-oauth20 \
  puppeteer redis sharp axios
echo "✅ All server dependencies installed"
cd ..
echo "🚀 Starting ClickZoom..."
npm run dev
