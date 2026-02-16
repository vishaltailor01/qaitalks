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
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      background: '#0a2540',
      color: '#fff',
      padding: '1rem',
      zIndex: 1000,
      textAlign: 'center',
    }}>
      We use cookies for authentication and analytics. By using this site, you consent to our use of cookies. See our{' '}
      <a href="/privacy-policy" style={{ color: '#4fd1c5', textDecoration: 'underline' }}>Privacy Policy</a>.
      <button
        onClick={handleAccept}
        style={{ marginLeft: '1rem', background: '#4fd1c5', color: '#0a2540', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
      >
        Accept
      </button>
    </div>
  );
}
