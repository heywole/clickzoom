import React, { useRef } from 'react';

const PreviewPlayer = ({ src, poster }) => {
  const videoRef = useRef(null);

  if (!src) {
    return (
      <div className="aspect-video bg-dark-card border border-dark-border rounded-xl flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-full bg-electric-blue/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-cz-gray text-sm">Video preview will appear here after generation</p>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black">
      <video ref={videoRef} src={src} poster={poster} controls className="w-full h-full" />
    </div>
  );
};

export default PreviewPlayer;
