import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatDate, truncateText } from '../../utils/helpers';

const TutorialCard = ({ tutorial, onDelete }) => {
  const outputIcons = {
    video: '🎬',
    image: '🖼️',
    both: '🎬🖼️',
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-electric-blue/40 transition-all duration-200 group">
      {/* Thumbnail placeholder */}
      <div className="h-36 bg-gradient-to-br from-electric-blue/10 to-neon-mint/10 flex items-center justify-center relative overflow-hidden">
        <div className="text-4xl">{outputIcons[tutorial.outputType] || '📋'}</div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link to={`/tutorials/${tutorial._id}`}
            className="bg-white/10 backdrop-blur text-white text-sm font-medium px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
            Open
          </Link>
        </div>
        <div className="absolute top-2 right-2">
          <Badge status={tutorial.status} />
        </div>
      </div>

      <div className="p-4">
        <Link to={`/tutorials/${tutorial._id}`}>
          <h3 className="font-semibold text-white hover:text-electric-blue transition-colors truncate">{tutorial.title}</h3>
        </Link>
        {tutorial.description && (
          <p className="text-xs text-cz-gray mt-1">{truncateText(tutorial.description, 60)}</p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-border">
          <div className="flex items-center gap-3 text-xs text-cz-gray">
            <span title="Steps">{tutorial.steps?.length || 0} steps</span>
            <span>•</span>
            <span>{formatDate(tutorial.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Link to={`/tutorials/${tutorial._id}`}
              className="p-1.5 rounded-lg text-cz-gray hover:text-electric-blue hover:bg-electric-blue/10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            <button onClick={() => onDelete(tutorial._id)}
              className="p-1.5 rounded-lg text-cz-gray hover:text-red-400 hover:bg-red-900/20 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialCard;
