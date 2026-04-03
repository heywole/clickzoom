import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useTutorial from '../hooks/useTutorial';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import ProgressBar from '../components/tutorial/ProgressBar';
import Button from '../components/common/Button';
import OutputSelector from '../components/tutorial/OutputSelector';
import { contentService, tutorialService } from '../services/apiService';
import { formatDate } from '../utils/helpers';

const TutorialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { current, loading, fetchById, generate, remove } = useTutorial();
  const [outputType, setOutputType] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [content, setContent] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isPro = user?.subscriptionTier !== 'free';

  const loadContent = useCallback(async () => {
    try {
      const { data } = await contentService.getByTutorial(id);
      setContent(data.content);
    } catch {}
  }, [id]);

  useEffect(() => {
    fetchById(id);
    loadContent();
  }, [id]);

  useEffect(() => {
    let interval;
    let timer;
    if (current?.status === 'processing') {
      interval = setInterval(() => {
        setGenerationProgress(p => Math.min(p + 1.5, 90));
        loadContent();
        fetchById(id);
      }, 4000);
      timer = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else if (current?.status === 'completed') {
      setGenerationProgress(100);
      loadContent();
    }
    return () => { clearInterval(interval); clearInterval(timer); };
  }, [current?.status]);

  const handleGenerate = async () => {
    if (!outputType) return toast.error('Please select an output type');
    setGenerating(true);
    setGenerationProgress(0);
    setElapsedSeconds(0);
    try {
      await generate(id, outputType);
      toast.success('Generation started!');
      setGenerationProgress(5);
    } catch {
      toast.error('Failed to start generation');
    } finally {
      setGenerating(false);
    }
  };

  const handleCancelGeneration = async () => {
    try {
      await tutorialService.cancel(id);
      toast.success('Generation cancelled');
      setGenerationProgress(0);
      setElapsedSeconds(0);
      fetchById(id);
    } catch (err) {
      toast.error('Cancel failed — please delete and recreate this tutorial');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this tutorial permanently?')) return;
    await remove(id);
    toast.success('Tutorial deleted');
    navigate('/dashboard');
  };

  const formatElapsed = (s) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  const isStuck = current?.status === 'processing' && elapsedSeconds > 300;

  if (loading && !current) return <Loader text="Loading tutorial..." />;
  if (!current) return (
    <div className="text-center py-20">
      <p className="text-cz-gray">Tutorial not found.</p>
      <Link to="/dashboard" className="text-electric-blue hover:underline mt-2 inline-block">Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/dashboard" className="text-cz-gray hover:text-white transition-colors text-sm">← Dashboard</Link>
          </div>
          <h1 className="text-2xl font-bold text-white">{current.title}</h1>
          {current.description && (
            <p className="text-cz-gray text-sm mt-1 max-w-2xl line-clamp-2">{current.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Badge status={current.status} />
            <span className="text-xs text-cz-gray">Created {formatDate(current.createdAt)}</span>
            {current.targetUrl && (
              <a href={current.targetUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-electric-blue hover:underline truncate max-w-[200px]">
                {current.targetUrl}
              </a>
            )}
          </div>
        </div>
        <button onClick={handleDelete}
          className="p-2 rounded-lg text-cz-gray hover:text-red-400 hover:bg-red-900/20 transition-colors flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {current.status === 'processing' && (
        <div className="bg-dark-card border border-electric-blue/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-electric-blue/20 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-electric-blue border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-white">Generating your content...</p>
                <p className="text-xs text-cz-gray">
                  {isStuck ? 'Taking longer than expected...' : `Usually 2 to 5 minutes · ${formatElapsed(elapsedSeconds)} elapsed`}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelGeneration}
              className="px-4 py-2 rounded-lg border border-dark-border text-cz-gray hover:text-white hover:border-white transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
          <ProgressBar value={generationProgress} animated color="blue" />

          {isStuck && (
            <div className="mt-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm font-medium">Generation is taking longer than usual</p>
              <p className="text-cz-gray text-xs mt-1">FFmpeg may still be setting up on the server. Cancel and try again in a few minutes.</p>
              <button
                onClick={handleCancelGeneration}
                className="mt-3 px-4 py-2 rounded-lg bg-dark-card border border-dark-border text-white text-sm hover:border-white transition-colors"
              >
                Cancel and Try Again
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            {['Capturing screenshots', 'Processing zoom effects', 'Generating voiceover'].map((s, i) => (
              <div key={i} className={`text-xs py-2 px-3 rounded-lg ${generationProgress > i * 30 ? 'bg-electric-blue/10 text-electric-blue' : 'bg-dark-border text-cz-gray'}`}>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {current.status === 'failed' && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-6 mb-6">
          <p className="font-semibold text-red-400 mb-2">Generation Failed</p>
          <p className="text-xs text-cz-gray mb-4">Something went wrong. Click below to reset and try again.</p>
          <button
            onClick={async () => {
              await tutorialService.cancel(id);
              fetchById(id);
            }}
            className="px-4 py-2 rounded-lg bg-dark-card border border-dark-border text-white text-sm"
          >
            Reset and Try Again
          </button>
        </div>
      )}

      {current.status === 'completed' && content && (
        <div className="bg-neon-mint/5 border border-neon-mint/20 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-neon-mint/20 flex items-center justify-center text-neon-mint font-bold">✓</div>
            <div>
              <p className="font-semibold text-white">Content Ready</p>
              <p className="text-xs text-cz-gray">Download now — files available for 24 hours</p>
            </div>
          </div>

          {content.contentType === 'image_set' && content.downloadUrls?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {content.downloadUrls.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-dark-border bg-deep-dark">
                  <img src={url} alt={`Step ${i + 1}`} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={url} download className="bg-neon-mint text-deep-dark font-bold px-3 py-1.5 rounded-lg text-xs">Download</a>
                  </div>
                  <p className="text-xs text-cz-gray text-center py-2">Step {i + 1}</p>
                </div>
              ))}
            </div>
          )}

          {content.contentType === 'video' && content.downloadUrls?.[0] && (
            <div className="mb-5 rounded-xl overflow-hidden border border-dark-border">
              <video controls className="w-full max-h-80" src={content.downloadUrls[0]} />
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {content.downloadUrls?.map((url, i) => (
              <a key={i} href={url} download
                className="flex items-center gap-2 bg-neon-mint hover:bg-green-400 text-deep-dark font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {content.contentType === 'video' && i === 0 ? 'Download Video' :
                 content.contentType === 'video' && i === 1 ? 'Download Subtitles' :
                 `Download Image ${i + 1}`}
              </a>
            ))}
          </div>
        </div>
      )}

      {current.status === 'draft' && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">Generate Content</h2>
          <OutputSelector
            selected={outputType}
            onChange={setOutputType}
            isPro={isPro}
            isLocked={current.isLocked}
            lockedType={current.lockedOutputType}
          />
          {!current.isLocked && (
            <div className="mt-4">
              <Button variant="mint" onClick={handleGenerate} loading={generating} disabled={!outputType}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Generation
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4">Tutorial Steps ({current.steps?.length || 0})</h2>
        {(!current.steps || current.steps.length === 0) ? (
          <p className="text-cz-gray text-sm text-center py-6">No steps captured yet.</p>
        ) : (
          <div className="space-y-3">
            {current.steps.map((step, i) => (
              <div key={step._id || i} className="flex gap-4 p-4 bg-deep-dark rounded-xl">
                <div className="w-8 h-8 rounded-full bg-electric-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{step.instructionText}</p>
                  {step.clickTarget?.description && (
                    <p className="text-xs text-cz-gray mt-1">Click: {step.clickTarget.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialDetail;
