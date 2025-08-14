import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { API_BASE_URL } from '../../constants';

type UserProfile = {
  name?: string;
  email?: string;
  picture?: string;
};

const Welcome: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const burst = () => {
      const end = Date.now() + 800;
      const colors = ['#6b69f9', '#9e9cfe', '#b3b2ff', '#6b69f9'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.98 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.98 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    };

    burst();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { code } = await chrome.storage.local.get('code');
        if (!code) return;
        const res = await fetch(`${API_BASE_URL}/extension/profile?code=${code}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (_) {
        // no-op
      }
    };
    loadProfile();
  }, []);

  const openBoard = () => {
    chrome.tabs.create({ url: 'https://www.thestickyapp.com/app' });
  };

  const closeTab = () => {
    window.close();
  };

  return (
    <div className="container">
      <div className="card reveal">
        <div className="logo-wrap"><img src={chrome.runtime.getURL('assets/img/logo.png')} alt="Sticky" width={72} height={72} style={{ borderRadius: 12, boxShadow: '0 4px 18px rgba(0, 0, 0, 0.12)' }} /></div>
        <div className="heading">
          <h1>{(() => {
            const firstName = profile?.name?.split?.(' ')?.[0] || profile?.email?.split?.('@')?.[0];
            return firstName ? `Welcome, ${firstName}` : 'Welcome to Sticky';
          })()}</h1>
          {/* <span className="inline-badge">Signed in</span> */}
        </div>
        {profile && (
          <div className="reveal" style={{ animationDelay: '90ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {profile?.picture ? (
              <img src={profile.picture} alt={profile?.name || 'User'} width={36} height={36} style={{ borderRadius: 999 }} />
            ) : null}
            {profile?.email ? <span style={{ color: '#666' }}>{profile.email}</span> : null}
          </div>
        )}
        <div className="muted reveal" style={{ animationDelay: '120ms' }}>
          You’re all set. Use the popup to pick a board and manage settings. The most powerful sticky note app for the web.
        </div>
        <div className="muted reveal" style={{ animationDelay: '160ms' }}>
         Right‑click anywhere to “Create Sticky"
        </div>
        <div className="button-row reveal" style={{ animationDelay: '220ms', marginTop: '16px' }}>
          <button className="primary-btn" onClick={openBoard}>Open Dashboard</button>
          <button className="secondary-btn" onClick={closeTab}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;


