import React, { useState } from 'react';
import Button from '../common/Button';

const StepEditor = ({ steps = [], onChange, isAutomated = false }) => {
  const [dragOver, setDragOver] = useState(null);

  const addStep = () => {
    const newStep = {
      id: Date.now().toString(),
      stepNumber: steps.length + 1,
      instructionText: '',
      screenshotUrl: '',
      clickTarget: { description: '', xCoordinate: 0, yCoordinate: 0 },
      transactionDetails: { requiresTransaction: false, transactionCount: 1 },
    };
    onChange([...steps, newStep]);
  };

  const updateStep = (index, field, value) => {
    const updated = steps.map((s, i) => i === index ? { ...s, [field]: value } : s);
    onChange(updated);
  };

  const removeStep = (index) => {
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 }));
    onChange(updated);
  };

  const moveStep = (from, to) => {
    const updated = [...steps];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  if (isAutomated) {
    return (
      <div className="bg-electric-blue/5 border border-electric-blue/20 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">🤖</div>
        <h3 className="font-semibold text-white mb-2">Automated Capture Active</h3>
        <p className="text-sm text-cz-gray">ClickZoom will automatically visit your URL, detect all click targets, and capture each step. You can review and edit steps after capture.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div
          key={step.id || index}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('stepIndex', index)}
          onDragOver={(e) => { e.preventDefault(); setDragOver(index); }}
          onDrop={(e) => { const from = parseInt(e.dataTransfer.getData('stepIndex')); moveStep(from, index); setDragOver(null); }}
          onDragLeave={() => setDragOver(null)}
          className={`bg-dark-card border rounded-xl p-4 transition-colors ${dragOver === index ? 'border-electric-blue' : 'border-dark-border'}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="w-7 h-7 rounded-full bg-electric-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {step.stepNumber}
              </div>
              <svg className="w-4 h-4 text-cz-gray cursor-grab" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={step.instructionText}
                onChange={(e) => updateStep(index, 'instructionText', e.target.value)}
                placeholder={`Step ${step.stepNumber}: Describe what to do here...`}
                rows={2}
                className="bg-deep-dark border border-dark-border rounded-lg px-3 py-2 text-white placeholder-cz-gray focus:outline-none focus:border-electric-blue w-full text-sm resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={step.clickTarget?.description || ''}
                  onChange={(e) => updateStep(index, 'clickTarget', { ...step.clickTarget, description: e.target.value })}
                  placeholder="Click target description..."
                  className="bg-deep-dark border border-dark-border rounded-lg px-3 py-2 text-white placeholder-cz-gray focus:outline-none focus:border-electric-blue text-sm"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`tx-${index}`}
                    checked={step.transactionDetails?.requiresTransaction || false}
                    onChange={(e) => updateStep(index, 'transactionDetails', { ...step.transactionDetails, requiresTransaction: e.target.checked })}
                    className="w-4 h-4 accent-electric-blue"
                  />
                  <label htmlFor={`tx-${index}`} className="text-sm text-cz-gray">Requires transaction</label>
                  {step.transactionDetails?.requiresTransaction && (
                    <input
                      type="number"
                      min={1}
                      value={step.transactionDetails.transactionCount || 1}
                      onChange={(e) => updateStep(index, 'transactionDetails', { ...step.transactionDetails, transactionCount: parseInt(e.target.value) })}
                      className="w-16 bg-deep-dark border border-dark-border rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-electric-blue"
                    />
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => removeStep(index)}
              className="p-1.5 rounded-lg text-cz-gray hover:text-red-400 hover:bg-red-900/20 transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      <Button onClick={addStep} variant="secondary" icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      }>
        Add Step
      </Button>
    </div>
  );
};

export default StepEditor;
