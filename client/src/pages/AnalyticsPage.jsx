import React, { useEffect } from 'react';
import useTutorial from '../hooks/useTutorial';
import StatsCard from '../components/dashboard/StatsCard';
import Loader from '../components/common/Loader';

const AnalyticsPage = () => {
  const { tutorials, loading, fetchAll } = useTutorial();

  useEffect(() => { fetchAll({}); }, []);

  const totalViews = tutorials.reduce((sum, t) => sum + (t.viewCount || 0), 0);
  const totalDownloads = tutorials.reduce((sum, t) => sum + (t.downloadCount || 0), 0);
  const totalShares = tutorials.reduce((sum, t) => sum + (t.shareCount || 0), 0);
  const completed = tutorials.filter(t => t.status === 'completed').length;

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Views" value={totalViews.toLocaleString()} color="blue"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
        <StatsCard label="Downloads" value={totalDownloads.toLocaleString()} color="mint"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>} />
        <StatsCard label="Shares" value={totalShares.toLocaleString()} color="purple"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>} />
        <StatsCard label="Completed" value={completed} color="orange"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4">Tutorial Performance</h2>
        {tutorials.length === 0 ? (
          <p className="text-cz-gray text-sm text-center py-8">No tutorials to show analytics for yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left text-cz-gray font-medium py-2 pr-4">Tutorial</th>
                  <th className="text-right text-cz-gray font-medium py-2 px-4">Status</th>
                  <th className="text-right text-cz-gray font-medium py-2 px-4">Views</th>
                  <th className="text-right text-cz-gray font-medium py-2 px-4">Downloads</th>
                  <th className="text-right text-cz-gray font-medium py-2 pl-4">Shares</th>
                </tr>
              </thead>
              <tbody>
                {tutorials.map(t => (
                  <tr key={t._id} className="border-b border-dark-border last:border-0 hover:bg-dark-hover transition-colors">
                    <td className="py-3 pr-4 text-white font-medium max-w-[200px] truncate">{t.title}</td>
                    <td className="py-3 px-4 text-right capitalize text-cz-gray">{t.status}</td>
                    <td className="py-3 px-4 text-right text-white">{t.viewCount || 0}</td>
                    <td className="py-3 px-4 text-right text-white">{t.downloadCount || 0}</td>
                    <td className="py-3 pl-4 text-right text-white">{t.shareCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
