export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const truncateText = (text, maxLength = 80) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const generateTutorialId = () => {
  return 'tz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getStatusColor = (status) => {
  const map = {
    draft: 'text-cz-gray',
    processing: 'text-yellow-400',
    completed: 'text-neon-mint',
    failed: 'text-red-400',
  };
  return map[status] || 'text-cz-gray';
};

export const getStatusBg = (status) => {
  const map = {
    draft: 'bg-gray-800 text-gray-300',
    processing: 'bg-yellow-900/30 text-yellow-400',
    completed: 'bg-green-900/30 text-neon-mint',
    failed: 'bg-red-900/30 text-red-400',
  };
  return map[status] || 'bg-gray-800 text-gray-300';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
