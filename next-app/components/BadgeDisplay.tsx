import React, { useEffect, useState } from 'react';

type Badge = {
  id: string;
  awardedAt: string;
  verifiedUrl?: string;
  course: {
    title: string;
    slug: string;
  };
};

export default function BadgeDisplay() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBadges() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/badges');
        if (!res.ok) throw new Error('Failed to fetch badges');
        const data = await res.json();
        setBadges(data.badges || []);
      } catch (err: any) {
        setError(err.message || 'Error loading badges');
      } finally {
        setLoading(false);
      }
    }
    fetchBadges();
  }, []);

  if (loading) return <div>Loading badges...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!badges.length) return <div>No badges earned yet.</div>;

  return (
    <div className="flex flex-wrap gap-4 mt-6">
      {badges.map(badge => (
        <div key={badge.id} className="bg-paper-white border border-signal-yellow/40 rounded-xl shadow-md p-5 flex flex-col items-center min-w-[180px] font-sans">
          <div className="text-3xl mb-2">🏅</div>
          <div className="font-bold text-signal-yellow mb-1 text-center">{badge.course.title}</div>
          <div className="text-xs text-slate-500 mb-2">Awarded: {new Date(badge.awardedAt).toLocaleDateString()}</div>
          {badge.verifiedUrl && (
            <a href={badge.verifiedUrl} target="_blank" rel="noopener noreferrer" className="text-signal-yellow underline text-xs hover:text-signal-yellow/80 focus:outline-none focus:ring-2 focus:ring-electric-cyan transition">Verify Badge</a>
          )}
        </div>
      ))}
    </div>
  );
}