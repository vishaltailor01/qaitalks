"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { parseMaybeJson } from './profile-utils'

type Profile = {
  image?: string | null;
  about?: string | null;
  experience?: string | null; // stored as JSON string
  skills?: string | null; // stored as JSON string
  licenses?: string | null;
};

export default function ProfileView({ editUrl, userName }: { editUrl: string; userName?: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<any[]>([])

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setProfile(data || {});
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    // fetch badges separately
    (async () => {
      try {
        const r = await fetch('/api/badges')
        if (!r.ok) return
        const j = await r.json()
        if (!mounted) return
        setBadges(j?.badges || [])
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false };
  }, []);

  if (loading) return <div className="max-w-4xl mx-auto p-6">Loading profile…</div>;

  const exp: any[] = parseMaybeJson(profile?.experience)
  const skills: string[] = parseMaybeJson(profile?.skills) || []
  const certs: string[] = parseMaybeJson(profile?.licenses) || []

  return (
    <>

    <div className="max-w-4xl mx-auto bg-paper-white rounded-2xl shadow-lg overflow-hidden font-sans">
      <div className="h-56 bg-gradient-to-r from-signal-yellow to-electric-cyan relative rounded-t-2xl">
        <div className="absolute right-6 top-6">
          <Link href={editUrl} className="bg-paper-white text-signal-yellow font-semibold px-4 py-2 rounded-lg shadow-md border border-signal-yellow hover:bg-signal-yellow/10 focus:outline-none focus:ring-2 focus:ring-electric-cyan transition">Edit</Link>
        </div>
      </div>

      <div className="p-8 -mt-24 flex gap-8 items-start">
        <img
          src={profile?.image || '/default-avatar.png'}
          alt="avatar"
          width={160}
          height={160}
          className="rounded-full border-4 border-white shadow-lg object-cover -mt-12 bg-slate-100"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-black text-deep-navy tracking-tight font-sans">{userName || 'Profile'}</h1>
          {profile?.about && <p className="mt-3 text-slate-700 whitespace-pre-wrap font-normal">{profile.about}</p>}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="text-xs font-bold text-signal-yellow mb-2 uppercase tracking-wide">Experience</h3>
              {exp && exp.length ? (
                <div className="space-y-4 text-sm text-slate-700">
                  {exp.map((e: any, i: number) => {
                    if (!e) return null
                    if (typeof e === 'string') return <div key={i}>{e}</div>
                    const title = e.title || e.role || e.position
                    const company = e.company || e.employer
                    return (
                      <div key={i} className="">
                        <div className="font-semibold text-deep-navy text-base">{title}{company ? ` — ${company}` : ''}</div>
                        <div className="text-xs text-slate-500">{e.from || ''}{e.to ? ` — ${e.to}` : ''}</div>
                        {e.description && <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{e.description}</div>}
                      </div>
                    )
                  })}
                </div>
              ) : <p className="text-sm text-slate-400 mt-2">No experience listed</p>}
            </div>

            <div>
              <h3 className="text-xs font-bold text-signal-yellow mb-2 uppercase tracking-wide">Skills</h3>
              {skills && skills.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.map((s: string, i: number) => (
                    <span key={i} className="text-xs bg-signal-yellow/10 text-signal-yellow px-3 py-1 rounded-full border border-signal-yellow/30 font-medium">{s}</span>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-400 mt-2">No skills listed</p>}
            </div>

            <div>
              <h3 className="text-xs font-bold text-signal-yellow mb-2 uppercase tracking-wide">Certifications</h3>
              {certs && certs.length ? (
                <ul className="mt-2 text-sm text-slate-700 list-disc list-inside">
                  {certs.map((c: string, i: number) => <li key={i}>{c}</li>)}
                </ul>
              ) : <p className="text-sm text-slate-400 mt-2">No certifications</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
    

    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h2 className="text-xl font-bold text-signal-yellow mb-4 tracking-tight font-sans">Badges</h2>
      {badges && badges.length ? (
        <div className="flex flex-wrap gap-4">
          {badges.map((b: any) => (
            <div key={b.id} className="px-4 py-2 bg-paper-white border border-signal-yellow/40 rounded-lg shadow-sm text-sm font-medium text-signal-yellow flex items-center gap-2">
              <span className="text-lg">🏅</span>
              {b.course?.title || b.verifiedUrl || `Badge ${b.id.slice(0,6)}`}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No badges earned yet.</p>
      )}
    </div>
    </>
  );
}

