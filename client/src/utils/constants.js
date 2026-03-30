export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
};

export const OUTPUT_TYPES = {
  VIDEO: 'video',
  IMAGE: 'image',
  BOTH: 'both',
};

export const TUTORIAL_STATUS = {
  DRAFT: 'draft',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const INPUT_METHODS = {
  AUTOMATED: 'automated',
  MANUAL: 'manual',
};

export const VOICE_TYPES = ['male', 'female', 'neutral'];
export const VOICE_STYLES = ['professional', 'friendly', 'energetic', 'calm'];
export const VOICE_SPEEDS = [
  { label: '0.75x', value: 0.75 },
  { label: '1x (Normal)', value: 1 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese (Simplified)' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ru', label: 'Russian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'pl', label: 'Polish' },
  { code: 'tr', label: 'Turkish' },
  { code: 'sv', label: 'Swedish' },
  { code: 'da', label: 'Danish' },
  { code: 'fi', label: 'Finnish' },
  { code: 'nb', label: 'Norwegian' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'ig', label: 'Igbo' },
  { code: 'ha', label: 'Hausa' },
  { code: 'sw', label: 'Swahili' },
];

export const VIDEO_QUALITIES = ['720p', '1080p', '4K'];
export const VIDEO_FORMATS = ['mp4', 'webm'];
export const IMAGE_FORMATS = ['png', 'pdf'];

export const ZOOM_DEFAULTS = {
  level: 2.5,
  zoomInDuration: 0.5,
  holdDuration: 1.5,
  zoomOutDuration: 0.5,
};

export const SUPPORTED_CHAINS = [
  'Ethereum', 'Base', 'Arbitrum', 'Optimism', 'Polygon', 'BSC', 'Avalanche', 'Solana',
];

export const COLORS = {
  electricBlue: '#1A73E8',
  neonMint: '#00E5A0',
  deepDark: '#0D1117',
  white: '#FFFFFF',
  gray: '#888780',
};
