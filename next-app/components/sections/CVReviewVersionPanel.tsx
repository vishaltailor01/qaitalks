import React, { useEffect, useState } from 'react';
import { fetchVersions, deleteVersion, type CVReviewVersion } from '@/lib/cvReviewVersionApi';

interface CVReviewVersionPanelProps {
  onRestore: (version: CVReviewVersion) => void;
  currentVersionId?: string;
}

export const CVReviewVersionPanel: React.FC<CVReviewVersionPanelProps> = ({ onRestore, currentVersionId }) => {
  const [versions, setVersions] = useState<CVReviewVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchVersions()
      .then(setVersions)
      .catch(e => {
        if (e.message === 'UNAUTHORIZED') {
          setIsAuthenticated(false);
        } else {
          setError(e.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRestore = (version: CVReviewVersion) => {
    onRestore(version);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this version?')) return;
    setLoading(true);
    try {
      await deleteVersion(id);
      setVersions(vs => vs.filter(v => v.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show sign-in message
  if (!isAuthenticated) {
    return (
      <aside className="w-full max-w-xs bg-white border rounded p-4 shadow-md">
        <h2 className="font-bold text-lg mb-2">Version History</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>🔒 Sign in to save and access your version history.</p>
          <button 
            onClick={() => window.location.href = '/api/auth/signin'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full max-w-xs bg-white border rounded p-4 shadow-md">
      <h2 className="font-bold text-lg mb-2">Version History</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="space-y-2">
        {versions.map(v => (
          <li key={v.id} className={`p-2 rounded border ${v.id === currentVersionId ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{new Date(v.createdAt).toLocaleString()}</span>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:underline" onClick={() => handleRestore(v)}>Restore</button>
                <button className="text-red-500 hover:underline" onClick={() => handleDelete(v.id)}>Delete</button>
              </div>
            </div>
            <div className="text-xs text-gray-400 truncate">{v.meta ? JSON.parse(v.meta).summary || '' : ''}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

CVReviewVersionPanel.displayName = 'CVReviewVersionPanel';
