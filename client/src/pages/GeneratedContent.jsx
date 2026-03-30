import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentService } from '../services/apiService';
import Loader from '../components/common/Loader';
import { formatFileSize, formatDuration, formatDate } from '../utils/helpers';

const GeneratedContent = () => {
  const { tutorialId } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentService.getByTutorial(tutorialId)
      .then(r => setContent(r.data?.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tutorialId]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to={`/tutorials/${tutorialId}`} className="text-cz-gray hover:text-white text-sm">
          ← Back to Tutorial
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-white mb-6">Generated Content</h1>

      {/* Storage notice banner */}
      <div className="bg-electric-blue/10 border border-electric-blue/30 rounded-xl p-4 mb-6 flex gap-3">
        <span className="text-electric-blue text-xl flex-shrink-0">💾</span>
        <div>
          <p className="font-semibold text-white text-sm">Download and save to your device</p>
          <p className="text-cz-gray text-xs mt-0.5">
            Your content is ready. Download it now and save it to your device. 
            Cloud storage so you can access files anytime is coming soon.
          </p>
        </div>
      </div>

      {!content ? (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-xl">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-white font-semibold mb-2">No content generated yet</p>
          <Link to={`/tutorials/${tutorialId}`} className="text-electric-blue hover:underline text-sm">
            Go back and start generation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{content.contentType === 'video' ? '🎬' : '🖼️'}</span>
                  <p className="font-semibold text-white capitalize">
                    {content.contentType === 'image_set' ? 'Annotated Image Guide' : 'Video Walkthrough'}
                  </p>
                </div>
                <div className="flex gap-4 text-sm text-cz-gray flex-wrap">
                  {content.duration && <span>Duration: {formatDuration(content.duration)}</span>}
                  {content.qualitySettings?.resolution && <span>Quality: {content.qualitySettings.resolution}</span>}
                  {content.qualitySettings?.format && <span>Format: {content.qualitySettings.format?.toUpperCase()}</span>}
                  <span>Generated: {formatDate(content.generatedAt)}</span>
                </div>

                {/* Expiry warning */}
                <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400">
                  <span>⚠️</span>
                  <span>Files are available for 24 hours after generation. Download now to keep them.</span>
                </div>
              </div>

              {/* Download buttons */}
              <div className="flex flex-col gap-2">
                {content.downloadUrls?.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    download
                    className="flex items-center gap-2 bg-neon-mint hover:bg-green-400 text-deep-dark font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {content.contentType === 'video' && i === 0 ? 'Download Video (MP4)' :
                     content.contentType === 'video' && i === 1 ? 'Download Subtitles (SRT)' :
                     `Download Image ${i + 1}`}
                  </a>
                ))}
              </div>
            </div>

            {/* Video preview */}
            {content.contentType === 'video' && content.downloadUrls?.[0] && (
              <div className="mt-5 aspect-video rounded-xl overflow-hidden bg-black">
                <video src={content.downloadUrls[0]} controls className="w-full h-full" />
              </div>
            )}

            {/* Image previews */}
            {content.contentType === 'image_set' && content.downloadUrls?.length > 0 && (
              <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
                {content.downloadUrls.map((url, i) => (
                  <a key={i} href={url} download className="group relative">
                    <img src={url} alt={`Step ${i + 1}`} className="w-full rounded-lg border border-dark-border group-hover:border-electric-blue transition-colors" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Download</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Coming soon cloud storage card */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center flex-shrink-0 text-xl">☁️</div>
            <div>
              <p className="font-semibold text-white text-sm">Cloud Storage — Coming Soon</p>
              <p className="text-cz-gray text-xs mt-0.5">We are working on permanent cloud storage so your generated content is always accessible from your dashboard. Stay tuned.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedContent;
