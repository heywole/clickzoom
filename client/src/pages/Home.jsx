import React from 'react';
import { Link } from 'react-router-dom';
import { ClickZoomLogo } from '../components/layout/Navbar';

const Feature = ({ icon, title, desc }) => (
  <div className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-electric-blue/40 transition-colors">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-cz-gray leading-relaxed">{desc}</p>
  </div>
);

const Home = () => (
  <div className="min-h-screen bg-deep-dark">
    {/* Hero */}
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 text-center">
      <div className="flex justify-center mb-8">
        <ClickZoomLogo />
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
        Automate Your{' '}
        <span className="gradient-text">Content</span>
      </h1>
      <p className="text-lg md:text-xl text-cz-gray max-w-3xl mx-auto mb-10 leading-relaxed">
        Drop a URL and ClickZoom automatically creates professional step by step video walkthroughs with zoom effects and annotated image guides. No screen recording. No editing. No effort.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/register" className="bg-electric-blue hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors">
          Start for Free
        </Link>
        <Link to="/pricing" className="bg-dark-card border border-dark-border hover:border-electric-blue text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
          View Pricing
        </Link>
      </div>
    </div>

    {/* How it works */}
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { step: '01', title: 'Drop Your URL', desc: 'Paste any website URL or upload screenshots manually. ClickZoom handles the rest automatically.' },
          { step: '02', title: 'Configure Settings', desc: 'Choose your language, voice style, and output format. Preview your voice before generating.' },
          { step: '03', title: 'Download Output', desc: 'Get your professional video walkthrough or annotated image guide ready to publish.' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-electric-blue/10 border border-electric-blue/20 text-electric-blue font-black text-xl flex items-center justify-center mx-auto mb-4">
              {step}
            </div>
            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-cz-gray">{desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Features */}
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-white text-center mb-4">Everything Automated</h2>
      <p className="text-cz-gray text-center mb-12">Including Web3 DeFi walkthroughs with automatic wallet connection</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Feature icon="🔍" title="Auto Zoom on Every Click" desc="Every click target is automatically zoomed in at 2.5x with smooth animations and pulsing highlight rings." />
        <Feature icon="🎙️" title="Multilingual Voiceovers" desc="Generate professional voiceovers in any world language with multiple voice types, styles, and speeds." />
        <Feature icon="🌐" title="Web3 DeFi Support" desc="Built in wallet handles DeFi platforms automatically across all EVM chains plus Solana." />
        <Feature icon="🖼️" title="Annotated Image Guides" desc="Numbered screenshots with magnification insets and Neon Mint highlight rings around each click target." />
        <Feature icon="📝" title="Auto Subtitles" desc="Subtitles automatically generated and synchronized, exportable as SRT, with optional translation." />
        <Feature icon="⚡" title="Zero Manual Effort" desc="No screen recording software, no video editor, no annotation tools. One URL, full tutorial." />
      </div>
    </div>

    {/* CTA */}
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <div className="bg-gradient-to-r from-electric-blue/10 to-neon-mint/10 border border-electric-blue/20 rounded-2xl p-12">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to automate your content?</h2>
        <p className="text-cz-gray mb-8">Join thousands of creators who save hours every week with ClickZoom.</p>
        <Link to="/register" className="bg-neon-mint hover:bg-green-400 text-deep-dark font-bold px-10 py-4 rounded-xl text-lg transition-colors inline-block">
          Get Started Free
        </Link>
      </div>
    </div>
  </div>
);

export default Home;
