import React from 'react';

const outputs = [
  {
    value: 'video',
    label: 'Video Walkthrough',
    icon: '🎬',
    description: 'MP4 video with zoom effects, voiceover narration, and synchronized subtitles.',
    formats: 'MP4 · WebM · 720p / 1080p / 4K',
  },
  {
    value: 'image',
    label: 'Annotated Image Guide',
    icon: '🖼️',
    description: 'Annotated screenshots with numbered steps, zoom insets, and highlight rings.',
    formats: 'PNG · PDF',
  },
  {
    value: 'both',
    label: 'Both Outputs',
    icon: '✨',
    description: 'Get both the video walkthrough and annotated image guide from one generation.',
    formats: 'All formats included',
    proOnly: true,
  },
];

const OutputSelector = ({ selected, onChange, isPro = false, isLocked = false, lockedType }) => {
  const available = outputs.filter(o => !o.proOnly || isPro);

  if (isLocked) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-yellow-400 text-xl">🔒</span>
          <div>
            <p className="font-semibold text-yellow-400">Content Locked</p>
            <p className="text-sm text-cz-gray mt-1">
              You have already generated <strong className="text-white capitalize">{lockedType}</strong> content for this tutorial. 
              Upgrade to Pro to generate additional output types.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-cz-gray">Choose your output format. This cannot be changed after generation starts.</p>
      {outputs.map(output => {
        const disabled = output.proOnly && !isPro;
        const isSelected = selected === output.value;
        return (
          <button
            key={output.value}
            onClick={() => !disabled && onChange(output.value)}
            disabled={disabled}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              isSelected
                ? 'border-electric-blue bg-electric-blue/5'
                : disabled
                ? 'border-dark-border bg-dark-card/50 opacity-50 cursor-not-allowed'
                : 'border-dark-border bg-dark-card hover:border-electric-blue/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                isSelected ? 'border-electric-blue' : 'border-dark-border'
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-electric-blue" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{output.icon}</span>
                  <span className="font-semibold text-white">{output.label}</span>
                  {output.proOnly && (
                    <span className="text-xs bg-neon-mint/20 text-neon-mint px-2 py-0.5 rounded-full font-medium">Pro</span>
                  )}
                </div>
                <p className="text-sm text-cz-gray mt-1">{output.description}</p>
                <p className="text-xs text-electric-blue mt-1">{output.formats}</p>
              </div>
            </div>
          </button>
        );
      })}
      {!isPro && (
        <p className="text-xs text-cz-gray pt-1">
          Free users can only generate one output type per tutorial and cannot regenerate. <a href="/pricing" className="text-electric-blue hover:underline">Upgrade to Pro</a> for unlimited access.
        </p>
      )}
    </div>
  );
};

export default OutputSelector;
