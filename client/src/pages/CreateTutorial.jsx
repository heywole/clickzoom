import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTutorial from '../hooks/useTutorial';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import Button from '../components/common/Button';
import OutputSelector from '../components/tutorial/OutputSelector';
import ProgressBar from '../components/tutorial/ProgressBar';

const EXAMPLE_CONTENT = `Example:

Hashi BTC Tutorial

Go to https://devnet.hashi.sui.io
• Connect your SUI Wallet
• Click "Receive BTC" then copy your BTC address
• Go to https://coinfaucet.eu/en/btc-testnet4/
• Enter the address and claim BTC faucet
• Submit your deposit request`;

// Extract URLs from text
const extractUrls = (text) => {
  const urlRegex = /https?:\/\/[^\s\)>]+/g;
  return [...new Set(text.match(urlRegex) || [])];
};

const CreateTutorial = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { create, generate } = useTutorial();
  const isPro = user?.subscriptionTier !== 'free';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [outputType, setOutputType] = useState(null);
  const [showOutputSelector, setShowOutputSelector] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en', voiceType: 'female', voiceStyle: 'professional', speed: 1,
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const detectedUrls = extractUrls(content);

  const handleGenerate = async () => {
    if (!title.trim()) return toast.error('Please enter a title for your tutorial');
    if (!content.trim()) return toast.error('Please enter your tutorial content or paste a URL');
    if (!outputType) {
      setShowOutputSelector(true);
      toast.info('Please select an output type before generating');
      return;
    }

    setLoading(true);
    setProgress(5);
    setProgressLabel('Creating tutorial...');

    try {
      // Create the tutorial
      const result = await create({
        title: title.trim(),
        description: content.trim(),
        targetUrl: detectedUrls[0] || '',
        inputMethod: detectedUrls.length > 0 ? 'automated' : 'manual',
        outputType,
        voiceSettings,
        rawContent: content,
        detectedUrls,
      });

      const tutorialId = result.payload?.tutorial?._id;
      if (!tutorialId) throw new Error('Failed to create tutorial');

      setProgress(20);
      setProgressLabel('Starting generation...');

      // Start generation
      await generate(tutorialId, outputType);

      setProgress(40);
      setProgressLabel('ClickZoom is processing your content...');

      toast.success('Generation started! You will be notified when ready.');
      navigate(`/tutorials/${tutorialId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to start generation');
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Create Tutorial</h1>
        <p className="text-cz-gray text-sm mt-1">
          Paste a URL, write instructions, or drop any content. ClickZoom does the rest.
        </p>
      </div>

      {/* Main creation card */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-4">

        {/* Title */}
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Tutorial Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. How to bridge tokens on Base"
            className="bg-deep-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-cz-gray focus:outline-none focus:border-electric-blue w-full text-sm"
          />
        </div>

        {/* Content area */}
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Content <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={EXAMPLE_CONTENT}
            rows={10}
            className="bg-deep-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-cz-gray/50 focus:outline-none focus:border-electric-blue w-full text-sm resize-none leading-relaxed"
          />
          <p className="text-xs text-cz-gray mt-2">
            Paste a URL, write step by step instructions, or drop any tutorial content. ClickZoom automatically detects URLs and visits them to capture the tutorial.
          </p>
        </div>

        {/* Detected URLs */}
        {detectedUrls.length > 0 && (
          <div className="mb-5 bg-neon-mint/5 border border-neon-mint/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-neon-mint text-sm font-semibold">✓ {detectedUrls.length} URL{detectedUrls.length > 1 ? 's' : ''} detected</span>
            </div>
            <div className="space-y-1">
              {detectedUrls.map((url, i) => (
                <p key={i} className="text-xs text-cz-gray truncate">
                  <span className="text-electric-blue mr-2">{i + 1}.</span>{url}
                </p>
              ))}
            </div>
            <p className="text-xs text-neon-mint mt-2">ClickZoom will automatically visit and capture these sites.</p>
          </div>
        )}

        {/* Voice settings toggle */}
        <div className="mb-5">
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="flex items-center gap-2 text-sm text-cz-gray hover:text-white transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${showVoiceSettings ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Voice Settings (optional)
          </button>

          {showVoiceSettings && (
            <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-deep-dark rounded-xl border border-dark-border">
              <div>
                <label className="text-xs text-cz-gray mb-2 block">Language</label>
                <select value={voiceSettings.language} onChange={e => setVoiceSettings(v => ({ ...v, language: e.target.value }))}
                  className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-electric-blue w-full">
                  {[['en','English'],['es','Spanish'],['fr','French'],['de','German'],['pt','Portuguese'],['yo','Yoruba'],['ha','Hausa'],['sw','Swahili']].map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-cz-gray mb-2 block">Voice Type</label>
                <div className="flex gap-2">
                  {['male','female','neutral'].map(v => (
                    <button key={v} onClick={() => setVoiceSettings(vs => ({ ...vs, voiceType: v }))}
                      className={`flex-1 py-2 rounded-lg text-xs capitalize transition-colors ${voiceSettings.voiceType === v ? 'bg-electric-blue text-white' : 'bg-dark-card border border-dark-border text-cz-gray'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-cz-gray mb-2 block">Style</label>
                <div className="flex gap-1 flex-wrap">
                  {['professional','friendly','energetic','calm'].map(s => (
                    <button key={s} onClick={() => setVoiceSettings(vs => ({ ...vs, voiceStyle: s }))}
                      className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${voiceSettings.voiceStyle === s ? 'bg-electric-blue text-white' : 'bg-dark-card border border-dark-border text-cz-gray'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-cz-gray mb-2 block">Speed</label>
                <div className="flex gap-1">
                  {[['0.75x',0.75],['1x',1],['1.25x',1.25],['1.5x',1.5]].map(([label, val]) => (
                    <button key={val} onClick={() => setVoiceSettings(vs => ({ ...vs, speed: val }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${voiceSettings.speed === val ? 'bg-electric-blue text-white' : 'bg-dark-card border border-dark-border text-cz-gray'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output type toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowOutputSelector(!showOutputSelector)}
            className="flex items-center gap-2 text-sm text-cz-gray hover:text-white transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${showOutputSelector ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Output Type {outputType ? <span className="text-neon-mint">({outputType})</span> : <span className="text-red-400">— required</span>}
          </button>

          {showOutputSelector && (
            <div className="mt-4">
              <OutputSelector selected={outputType} onChange={setOutputType} isPro={isPro} />
            </div>
          )}
        </div>

        {/* Progress bar when generating */}
        {loading && (
          <div className="mb-5">
            <ProgressBar value={progress} label={progressLabel} animated color="mint" />
          </div>
        )}

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          loading={loading}
          variant="mint"
          fullWidth
          disabled={!title.trim() || !content.trim()}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate Tutorial
        </Button>
      </div>

      {/* Tips */}
      <div className="bg-electric-blue/5 border border-electric-blue/20 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-3">Tips for best results</p>
        <div className="space-y-2 text-xs text-cz-gray">
          <p>🔗 Include the full URL of the site you want to demonstrate</p>
          <p>📝 Write clear step by step instructions alongside the URL</p>
          <p>🌐 Works with any website including DeFi, NFT, and Web3 platforms</p>
          <p>💡 The more detail you provide, the better the tutorial output</p>
        </div>
      </div>
    </div>
  );
};

export default CreateTutorial;
