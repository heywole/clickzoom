import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useTutorial from '../hooks/useTutorial';
import useToast from '../hooks/useToast';
import TutorialCard from '../components/dashboard/TutorialCard';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const STATUSES = ['all', 'draft', 'processing', 'completed', 'failed'];

const TutorialsList = () => {
  const { tutorials, loading, fetchAll, remove } = useTutorial();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll({}); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tutorial?')) return;
    await remove(id);
    toast.success('Tutorial deleted');
  };

  const filtered = tutorials.filter(t => {
    const matchStatus = filter === 'all' || t.status === filter;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white">My Tutorials</h1>
        <Link to="/create">
          <Button icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>
            New Tutorial
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text" placeholder="Search tutorials..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-cz-gray focus:outline-none focus:border-electric-blue flex-1 text-sm"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm capitalize transition-colors ${filter === s ? 'bg-electric-blue text-white font-semibold' : 'bg-dark-card border border-dark-border text-cz-gray hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-xl">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-white font-semibold mb-2">{search ? 'No tutorials match your search' : 'No tutorials yet'}</p>
          {!search && <Link to="/create" className="text-electric-blue hover:underline text-sm">Create your first tutorial</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(t => <TutorialCard key={t._id} tutorial={t} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
};

export default TutorialsList;
