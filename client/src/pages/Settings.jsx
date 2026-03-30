import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProfile } from '../store/authSlice';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { userService } from '../services/apiService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { LANGUAGES, VOICE_TYPES, VOICE_STYLES } from '../utils/constants';

const Section = ({ title, children }) => (
  <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-5">
    <h2 className="font-semibold text-white mb-5">{title}</h2>
    {children}
  </div>
);

const Settings = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '' });
  const [prefs, setPrefs] = useState({ defaultLanguage: user?.preferences?.defaultLanguage || 'en', defaultVoiceType: user?.preferences?.defaultVoiceType || 'female', defaultVoiceStyle: user?.preferences?.defaultVoiceStyle || 'professional' });

  const saveProfile = async () => {
    setLoading(true);
    try {
      await userService.updateProfile(profile);
      await dispatch(fetchProfile());
      toast.success('Profile updated successfully');
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const savePrefs = async () => {
    setLoading(true);
    try {
      await userService.updatePreferences(prefs);
      await dispatch(fetchProfile());
      toast.success('Preferences saved');
    } catch { toast.error('Failed to save preferences'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      <Section title="Profile">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" name="firstName" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
            <Input label="Last name" name="lastName" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
          </div>
          <Input label="Email address" name="email" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
          <Button onClick={saveProfile} loading={loading}>Save Profile</Button>
        </div>
      </Section>

      <Section title="Default Preferences">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Default Language</label>
            <select value={prefs.defaultLanguage} onChange={e => setPrefs(p => ({ ...p, defaultLanguage: e.target.value }))}
              className="bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric-blue w-full">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Default Voice Type</label>
            <div className="flex gap-2">
              {VOICE_TYPES.map(v => (
                <button key={v} onClick={() => setPrefs(p => ({ ...p, defaultVoiceType: v }))}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${prefs.defaultVoiceType === v ? 'bg-electric-blue text-white' : 'bg-dark-hover border border-dark-border text-cz-gray hover:text-white'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Default Voice Style</label>
            <div className="flex gap-2 flex-wrap">
              {VOICE_STYLES.map(s => (
                <button key={s} onClick={() => setPrefs(p => ({ ...p, defaultVoiceStyle: s }))}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${prefs.defaultVoiceStyle === s ? 'bg-electric-blue text-white' : 'bg-dark-hover border border-dark-border text-cz-gray hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={savePrefs} loading={loading}>Save Preferences</Button>
        </div>
      </Section>

      <Section title="Subscription">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white capitalize">{user?.subscriptionTier || 'Free'} Plan</p>
            <p className="text-sm text-cz-gray mt-0.5">{user?.subscriptionTier === 'free' ? 'Limited to one output per tutorial' : 'Full access to all features'}</p>
          </div>
          {user?.subscriptionTier === 'free' && (
            <a href="/pricing" className="bg-neon-mint hover:bg-green-400 text-deep-dark font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Upgrade to Pro
            </a>
          )}
        </div>
      </Section>

      <Section title="Danger Zone">
        <div className="border border-red-900/50 rounded-xl p-4 bg-red-900/10">
          <p className="font-medium text-red-400 mb-1">Delete Account</p>
          <p className="text-sm text-cz-gray mb-4">Permanently delete your account and all tutorials. This action cannot be undone.</p>
          <Button variant="danger" onClick={() => toast.error('Please contact support to delete your account')}>
            Delete My Account
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default Settings;
