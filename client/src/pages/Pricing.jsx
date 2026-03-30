import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Check = () => (
  <svg className="w-5 h-5 text-neon-mint flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const X = () => (
  <svg className="w-5 h-5 text-cz-gray flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started automating your content at no cost',
    color: 'border-dark-border',
    features: [
      { text: 'Automated URL capture', included: true },
      { text: 'Choose one output per tutorial', included: true },
      { text: 'Multilingual voiceovers', included: true },
      { text: 'Auto generated subtitles', included: true },
      { text: '720p video quality', included: true },
      { text: 'Web3 wallet capture', included: true },
      { text: 'Both video and image output', included: false },
      { text: 'Unlimited regeneration', included: false },
      { text: '4K video quality', included: false },
      { text: 'Priority processing', included: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/register',
    ctaVariant: 'secondary',
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'Everything you need to create unlimited professional tutorials',
    color: 'border-electric-blue',
    badge: 'Most Popular',
    features: [
      { text: 'Automated URL capture', included: true },
      { text: 'Both video and image output simultaneously', included: true },
      { text: 'Multilingual voiceovers', included: true },
      { text: 'Auto generated subtitles with translation', included: true },
      { text: '4K video quality', included: true },
      { text: 'Web3 wallet capture', included: true },
      { text: 'Unlimited regeneration', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'SRT subtitle export', included: true },
    ],
    cta: 'Start Pro Trial',
    ctaLink: '/register',
    ctaVariant: 'primary',
  },
];

const Pricing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-4">Simple Pricing</h1>
        <p className="text-cz-gray text-lg">Start free. Upgrade when you need more power.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {plans.map(plan => (
          <div key={plan.name} className={`bg-dark-card border-2 ${plan.color} rounded-2xl p-8 relative`}>
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-electric-blue text-white text-xs font-bold px-4 py-1.5 rounded-full">{plan.badge}</span>
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-cz-gray text-sm">/ {plan.period}</span>
              </div>
              <p className="text-sm text-cz-gray mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  {f.included ? <Check /> : <X />}
                  <span className={`text-sm ${f.included ? 'text-white' : 'text-cz-gray'}`}>{f.text}</span>
                </li>
              ))}
            </ul>

            <Link
              to={isAuthenticated ? '/dashboard' : plan.ctaLink}
              className={`block text-center font-bold py-3.5 rounded-xl transition-colors ${
                plan.ctaVariant === 'primary'
                  ? 'bg-electric-blue hover:bg-blue-600 text-white'
                  : 'bg-dark-hover border border-dark-border text-white hover:border-electric-blue'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
        <h3 className="font-bold text-white mb-6 text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { q: 'Can I use the free tier forever?', a: 'Yes. The free tier has no time limit. You can create tutorials at no cost indefinitely.' },
            { q: 'What is the one output rule on free?', a: 'Free users choose either video or image output before generation. Once generated, that tutorial is locked to that output type.' },
            { q: 'How does Web3 capture work?', a: 'ClickZoom has a built in internal wallet that automatically connects to DeFi platforms and approves transactions during tutorial capture.' },
            { q: 'What languages are supported?', a: 'All world languages are supported for voiceover generation and subtitle translation.' },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="font-semibold text-white text-sm mb-2">{q}</p>
              <p className="text-cz-gray text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
