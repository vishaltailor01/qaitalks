"use client";
import { useState, useEffect } from 'react';


export default function ConsentBanner() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookieConsent') === 'true';
      setAccepted(consent);
    }
  }, []);

  if (accepted) return null;

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookieConsent', 'true');
    }
    setAccepted(true);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 w-full bg-black text-white p-4 z-50 text-center border-t-4 border-signal-yellow shadow-[0_-4px_0_0_rgba(255,182,0,0.10)] font-sans"
    >
      <span className="font-medium">We use cookies for authentication and analytics. By using this site, you consent to our use of cookies.</span> See our{' '}
      <a href="/privacy-policy" className="text-white underline font-medium hover:text-signal-yellow focus:outline-none focus:ring-2 focus:ring-electric-cyan transition">Privacy Policy</a>.
      <button
        onClick={handleAccept}
        aria-label="Accept cookies"
        className="ml-4 bg-signal-yellow text-deep-navy border-none px-5 py-2 rounded-lg cursor-pointer font-semibold shadow-sm hover:bg-signal-yellow/90 focus:outline-none focus:ring-2 focus:ring-electric-cyan transition"
      >
        Accept
      </button>
    </div>
  );
}
