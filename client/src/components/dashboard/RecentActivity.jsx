import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/helpers';

const RecentActivity = ({ tutorials = [] }) => {
  if (!tutorials.length) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">Recent Tutorials</h3>
        <div className="text-center py-8">
          <p className="text-cz-gray text-sm">No tutorials yet.</p>
          <Link to="/create" className="text-electric-blue text-sm hover:underline mt-2 inline-block">Create your first tutorial</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Recent Tutorials</h3>
        <Link to="/tutorials" className="text-xs text-electric-blue hover:underline">View all</Link>
      </div>
      <div className="space-y-3">
        {tutorials.slice(0, 5).map((t) => (
          <Link key={t._id} to={`/tutorials/${t._id}`}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-hover transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center flex-shrink-0 text-lg">
              {t.outputType === 'video' ? '🎬' : t.outputType === 'image' ? '🖼️' : '🎬'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white group-hover:text-electric-blue transition-colors truncate">{t.title}</p>
              <p className="text-xs text-cz-gray">{formatDate(t.createdAt)} · {t.steps?.length || 0} steps</p>
            </div>
            <Badge status={t.status} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
