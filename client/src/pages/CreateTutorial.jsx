import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTutorial from '../hooks/useTutorial';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import StepEditor from '../components/tutorial/StepEditor';
import VoiceSettings from '../components/tutorial/VoiceSettings';
import OutputSelector from '../components/tutorial/OutputSelector';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProgressBar from '../components/tutorial/ProgressBar';

const WIZARD_STEPS = [
  'Tutorial Info',
  'Content & Steps',
  'Voice Settings',
  'Output Type',
  'Review & Generate',
];

const CreateTutorial = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { create, generate } = useTutorial();
  const isPro = user?.subscriptionTier === 'pro' || user?.subscriptionTier === 'enterprise';

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetUrl: '',
    inputMethod: 'automated',
    steps: [],
    voiceSettings: { language: 'en', voiceType: 'female', voiceStyle: 'professional', speed: 1, accent: '' },
    outputType: null,
  });

  const updateForm = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const canProceed = () => {
    if (step === 0) return form.title.trim().length > 0;
    if (step === 1) {
      if (form.inputMethod === 'automated') return form.targetUrl.trim().length > 0;
      return form.steps.length > 0;
    }
    if (step === 3) return form.outputType !== null;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) { toast.error('Please complete all required fields before continuing'); return; }
    setStep(s => s + 1);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let id = createdId;
      if (!id) {
        const result = await create({
          title: form.title,
          description: form.description,
          targetUrl: form.targetUrl,
          inputMethod: form.inputMethod,
          outputType: form.outputType,
          voiceSettings: form.voiceSettings,
          steps: form.steps,
        });
        id = result.payload?.tutorial?._id;
        setCreatedId(id);
      }
      if (!id) throw new Error('Failed to create tutorial');
      await generate(id, form.outputType);
      toast.success('Generation started! We will notify you when it is ready.');
      navigate(`/tutorials/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to start generation');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create Tutorial</h1>
        <p className="text-cz-gray text-sm">Step {step + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[step]}</p>
        <div className="mt-4">
          <ProgressBar value={progress} showPercent={false} color="blue" />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {WIZARD_STEPS.map((label, i) => (
            <button key={i} onClick={() => i < step && setStep(i)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
                i === step ? 'bg-electric-blue text-white font-semibold' :
                i < step ? 'bg-neon-mint/20 text-neon-mint cursor-pointer' :
                'bg-dark-card text-cz-gray'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 mb-6">
        {/* Step 0: Tutorial Info */}
        {step === 0 && (
          <div className="space-y-5">
            <Input label="Tutorial Title" name="title" value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="e.g. How to swap tokens on Uniswap" required />
            <Input label="Description (optional)" name="description" type="textarea" value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="Brief description of what this tutorial covers..." />
          </div>
        )}

        {/* Step 1: Content */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">Input Method</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'automated', label: 'Automated URL Capture', icon: '🤖', desc: 'ClickZoom visits and captures automatically' },
                  { value: 'manual', label: 'Manual Upload', icon: '📤', desc: 'Upload screenshots and write steps yourself' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => updateForm('inputMethod', opt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-colors ${form.inputMethod === opt.value ? 'border-electric-blue bg-electric-blue/5' : 'border-dark-border hover:border-electric-blue/40'}`}>
                    <div className="text-2xl mb-2">{opt.icon}</div>
                    <p className="font-semibold text-white text-sm">{opt.label}</p>
                    <p className="text-xs text-cz-gray mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {form.inputMethod === 'automated' ? (
              <Input label="Target URL" name="targetUrl" type="url" value={form.targetUrl}
                onChange={e => updateForm('targetUrl', e.target.value)}
                placeholder="https://app.uniswap.org" required
                hint="ClickZoom will visit this URL, navigate it, detect click targets, and capture every step automatically." />
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">Tutorial Steps</label>
                <StepEditor steps={form.steps} onChange={steps => updateForm('steps', steps)} isAutomated={false} />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Voice */}
        {step === 2 && (
          <div>
            <h3 className="font-semibold text-white mb-4">Voice Settings</h3>
            <VoiceSettings settings={form.voiceSettings} onChange={vs => updateForm('voiceSettings', vs)} />
          </div>
        )}

        {/* Step 3: Output */}
        {step === 3 && (
          <div>
            <h3 className="font-semibold text-white mb-4">Choose Output Type</h3>
            <OutputSelector selected={form.outputType} onChange={ot => updateForm('outputType', ot)} isPro={isPro} />
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-white mb-4">Review and Generate</h3>
            {[
              { label: 'Title', value: form.title },
              { label: 'Input Method', value: form.inputMethod === 'automated' ? `Automated capture from ${form.targetUrl}` : `Manual (${form.steps.length} steps)` },
              { label: 'Language', value: form.voiceSettings.language?.toUpperCase() },
              { label: 'Voice', value: `${form.voiceSettings.voiceType} · ${form.voiceSettings.voiceStyle} · ${form.voiceSettings.speed}x` },
              { label: 'Output Type', value: form.outputType ? form.outputType.charAt(0).toUpperCase() + form.outputType.slice(1) : 'Not selected' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start py-3 border-b border-dark-border last:border-0">
                <span className="text-cz-gray text-sm">{label}</span>
                <span className="text-white text-sm font-medium text-right max-w-[60%]">{value}</span>
              </div>
            ))}
            <div className="bg-neon-mint/5 border border-neon-mint/20 rounded-xl p-4 mt-4">
              <p className="text-sm text-neon-mint font-medium">Ready to generate</p>
              <p className="text-xs text-cz-gray mt-1">Output type cannot be changed once generation begins. Free users are limited to one output per tutorial.</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => step === 0 ? null : setStep(s => s - 1)} disabled={step === 0}>
          Back
        </Button>
        {step < WIZARD_STEPS.length - 1 ? (
          <Button onClick={handleNext} disabled={!canProceed()}>Next</Button>
        ) : (
          <Button variant="mint" onClick={handleGenerate} loading={loading}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Content
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateTutorial;
