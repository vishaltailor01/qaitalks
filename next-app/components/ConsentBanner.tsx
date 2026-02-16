"use client";
import { useState } from 'react';

export default function ConsentBanner() {
  const [accepted, setAccepted] = useState(
    typeof window !== 'undefined' && localStorage.getItem('cookieConsent') === 'true'
  );

  if (accepted) return null;

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookieConsent', 'true');
    }
    setAccepted(true);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-blue-900 text-white p-4 z-50 text-center">
      We use cookies for authentication and analytics. By using this site, you consent to our use of cookies. See our{' '}
      <a href="/privacy-policy" className="text-teal-400 underline">Privacy Policy</a>.
      <button
        onClick={handleAccept}
        className="ml-4 bg-teal-400 text-blue-900 border-none px-4 py-2 rounded cursor-pointer"
      >
        Accept
      </button>
    </div>
  );
}
