import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useTutorial from '../hooks/useTutorial';
import useAuth from '../hooks/useAuth';
import StatsCard from '../components/dashboard/StatsCard';
import TutorialCard from '../components/dashboard/TutorialCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import Loader from '../components/common/Loader';
import useToast from '../hooks/useToast';

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { tutorials, loading, fetchAll, remove } = useTutorial();

  useEffect(() => { fetchAll({ limit: 10 }); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tutorial? This cannot be undone.')) return;
    await remove(id);
    toast.success('Tutorial deleted');
  };

  const stats = {
    total: tutorials.length,
    completed: tutorials.filter(t => t.status === 'completed').length,
    processing: tutorials.filter(t => t.status === 'processing').length,
    views: tutorials.reduce((sum, t) => sum + (t.viewCount || 0), 0),
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-cz-gray text-sm mt-1">Here is what is happening with your tutorials</p>
        </div>
        <Link to="/create"
          className="inline-flex items-center gap-2 bg-electric-blue hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Tutorial
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Tutorials" value={stats.total} color="blue"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        <StatsCard label="Completed" value={stats.completed} color="mint"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatsCard label="Processing" value={stats.processing} color="orange"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatsCard label="Total Views" value={stats.views.toLocaleString()} color="purple"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
      </div>

      {/* Plan banner for free users */}
      {user?.subscriptionTier === 'free' && (
        <div className="bg-gradient-to-r from-electric-blue/10 to-neon-mint/10 border border-electric-blue/20 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white">You are on the Free plan</p>
            <p className="text-sm text-cz-gray mt-1">Upgrade to Pro for both video and image outputs, unlimited regeneration, and more.</p>
          </div>
          <Link to="/pricing" className="flex-shrink-0 bg-neon-mint hover:bg-green-400 text-deep-dark font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Tutorials</h2>
            <Link to="/tutorials" className="text-xs text-electric-blue hover:underline">View all</Link>
          </div>
          {loading ? <Loader /> : (
            tutorials.length === 0 ? (
              <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
                <div className="text-5xl mb-4">🎬</div>
                <h3 className="font-semibold text-white mb-2">No tutorials yet</h3>
                <p className="text-cz-gray text-sm mb-6">Create your first automated tutorial in minutes</p>
                <Link to="/create" className="bg-electric-blue hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors inline-block">
                  Create First Tutorial
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tutorials.slice(0, 6).map(t => (
                  <TutorialCard key={t._id} tutorial={t} onDelete={handleDelete} />
                ))}
              </div>
            )
          )}
        </div>
        <div>
          <RecentActivity tutorials={tutorials} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
