import React, { useState } from 'react';
import { VOICE_TYPES, VOICE_STYLES, VOICE_SPEEDS, LANGUAGES } from '../../utils/constants';
import { voiceService } from '../../services/apiService';
import Button from '../common/Button';
import useToast from '../../hooks/useToast';

const VoiceSettings = ({ settings = {}, onChange }) => {
  const toast = useToast();
  const [previewing, setPreviewing] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const update = (key, value) => onChange({ ...settings, [key]: value });

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      await voiceService.preview(settings);
      toast.success('Voice preview generated!');
    } catch {
      toast.error('Preview failed. Check your voice settings.');
    } finally {
      setPreviewing(false);
    }
  };

  const filteredLangs = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">Language</label>
        <input
          type="text"
          placeholder="Search languages..."
          value={langSearch}
          onChange={(e) => setLangSearch(e.target.value)}
          className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-cz-gray focus:outline-none focus:border-electric-blue w-full text-sm mb-2"
        />
        <div className="max-h-40 overflow-y-auto bg-dark-card border border-dark-border rounded-lg">
          {filteredLangs.map(lang => (
            <button key={lang.code} onClick={() => { update('language', lang.code); setLangSearch(''); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-dark-hover transition-colors ${settings.language === lang.code ? 'text-electric-blue bg-electric-blue/5' : 'text-white'}`}>
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Voice Type</label>
          <div className="flex gap-2 flex-wrap">
            {VOICE_TYPES.map(v => (
              <button key={v} onClick={() => update('voiceType', v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${settings.voiceType === v ? 'bg-electric-blue text-white' : 'bg-dark-card border border-dark-border text-cz-gray hover:text-white'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Style</label>
          <div className="flex gap-2 flex-wrap">
            {VOICE_STYLES.map(s => (
              <button key={s} onClick={() => update('voiceStyle', s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${settings.voiceStyle === s ? 'bg-electric-blue text-white' : 'bg-dark-card border border-dark-border text-cz-gray hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Speed</label>
        <div className="flex gap-2">
          {VOICE_SPEEDS.map(({ label, value }) => (
            <button key={value} onClick={() => update('speed', value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.speed === value ? 'bg-electric-blue text-white' : 'bg-dark-card border border-dark-border text-cz-gray hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Accent (Optional)</label>
        <input
          type="text"
          placeholder="e.g. British, American, Australian..."
          value={settings.accent || ''}
          onChange={(e) => update('accent', e.target.value)}
          className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-cz-gray focus:outline-none focus:border-electric-blue w-full text-sm"
        />
      </div>

      <Button onClick={handlePreview} loading={previewing} variant="secondary">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 9.5v5m0 0l-1.5-1.5M12 14.5l1.5-1.5M9 9a3 3 0 000 6" />
        </svg>
        Preview Voice (10 seconds)
      </Button>
    </div>
  );
};

export default VoiceSettings;
