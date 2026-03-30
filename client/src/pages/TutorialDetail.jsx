import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useTutorial from '../hooks/useTutorial';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import ProgressBar from '../components/tutorial/ProgressBar';
import Button from '../components/common/Button';
import OutputSelector from '../components/tutorial/OutputSelector';
import { contentService } from '../services/apiService';
import { formatDate, formatDuration } from '../utils/helpers';

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
  const isPro = user?.subscriptionTier !== 'free';

  useEffect(() => {
    fetchById(id);
    loadContent();
  }, [id]);

  useEffect(() => {
    let interval;
    if (current?.status === 'processing') {
      interval = setInterval(() => {
        setGenerationProgress(p => Math.min(p + Math.random() * 5, 90));
        loadContent();
      }, 3000);
    } else if (current?.status === 'completed') {
      setGenerationProgress(100);
    }
    return () => clearInterval(interval);
  }, [current?.status]);

  const loadContent = async () => {
    try {
      const { data } = await contentService.getByTutorial(id);
      setContent(data.content);
    } catch {}
  };

  const handleGenerate = async () => {
    if (!outputType) return toast.error('Please select an output type');
    setGenerating(true);
    setGenerationProgress(0);
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

  const handleDelete = async () => {
    if (!window.confirm('Delete this tutorial permanently?')) return;
    await remove(id);
    toast.success('Tutorial deleted');
    navigate('/dashboard');
  };

  if (loading && !current) return <Loader text="Loading tutorial..." />;
  if (!current) return (
    <div className="text-center py-20">
      <p className="text-cz-gray">Tutorial not found.</p>
      <Link to="/dashboard" className="text-electric-blue hover:underline mt-2 inline-block">Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/dashboard" className="text-cz-gray hover:text-white transition-colors text-sm">← Dashboard</Link>
            <span className="text-dark-border">/</span>
            <span className="text-cz-gray text-sm">Tutorial</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{current.title}</h1>
          {current.description && <p className="text-cz-gray text-sm mt-1">{current.description}</p>}
          <div className="flex items-center gap-3 mt-3">
            <Badge status={current.status} />
            <span className="text-xs text-cz-gray">Created {formatDate(current.createdAt)}</span>
            {current.targetUrl && (
              <a href={current.targetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-electric-blue hover:underline truncate max-w-[200px]">
                {current.targetUrl}
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleDelete}>
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Processing progress */}
      {current.status === 'processing' && (
        <div className="bg-dark-card border border-electric-blue/30 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-electric-blue/20 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-electric-blue border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-white">Generating your content...</p>
              <p className="text-xs text-cz-gray">This usually takes 2 to 5 minutes</p>
            </div>
          </div>
          <ProgressBar value={generationProgress} animated color="blue" />
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            {['Capturing screenshots', 'Processing zoom effects', 'Generating voiceover'].map((s, i) => (
              <div key={i} className={`text-xs py-2 px-3 rounded-lg ${generationProgress > i * 30 ? 'bg-electric-blue/10 text-electric-blue' : 'bg-dark-border text-cz-gray'}`}>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed content */}
      {current.status === 'completed' && content && (
        <div className="bg-neon-mint/5 border border-neon-mint/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neon-mint/20 flex items-center justify-center text-neon-mint">✓</div>
              <div>
                <p className="font-semibold text-white">Content Ready</p>
                <p className="text-xs text-cz-gray">{content.contentType === 'video' ? `${formatDuration(content.duration)} · ${content.qualitySettings?.resolution || '1080p'}` : `${content.fileUrls?.length || 0} annotated images`}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {content.fileUrls?.map((url, i) => (
                <a key={i} href={url} download className="bg-electric-blue hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Download {i + 1}
                </a>
              ))}
            </div>
          </div>
          {content.contentType === 'video' && content.fileUrls?.[0] && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <video src={content.fileUrls[0]} controls className="w-full h-full" />
            </div>
          )}
        </div>
      )}

      {/* Generate section for draft */}
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

      {/* Steps list */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4">Tutorial Steps ({current.steps?.length || 0})</h2>
        {(!current.steps || current.steps.length === 0) ? (
          <p className="text-cz-gray text-sm text-center py-6">No steps captured yet. Steps will appear here after automated capture.</p>
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
                  {step.transactionDetails?.requiresTransaction && (
                    <div className="mt-2 text-xs bg-orange-900/20 border border-orange-600/30 text-orange-400 px-3 py-1.5 rounded-lg inline-block">
                      Note: You will need to complete this transaction {step.transactionDetails.transactionCount} times in total.
                    </div>
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
