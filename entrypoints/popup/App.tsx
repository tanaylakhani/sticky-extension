import React, { useEffect, useState } from 'react';
import './App.css';
import { fetchBoards, fetchUserProfile, fetchUserPaymentStatus } from '../../services/api';
import { Board } from '../../types';
import { ExternalLink, Settings, StickyNote, Layout, User } from 'lucide-react';
import { BASE_URL } from '../../constants';
import { CreateStickyMessage } from '../background';

// Declare the Chrome extension API for TypeScript to avoid TS compile errors
declare const chrome: any;

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

interface PaymentStatus {
  userType: number;
  subscriptionLifeCycle: number;
}

const USER_TYPE = {
  FREE: 1,
  MONTHLY_SUBSCRIPTION: 2,
  ONE_TIME_FULL_ACCESS: 3,
};

const SUBSCRIPTION_LIFECYCLE = {
  INVALID: 0,
  STARTED: 1,
  PAID: 2,
  CANCELLED: 3,
};

const App = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [lastSelectedBoardId, setLastSelectedBoardId] = useState<string | null>(
    null
  );
  const [code, setCode] = useState<string>('');
  const [isValidCode, setIsValidCode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDraggableIcon, setShowDraggableIcon] = useState<boolean>(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  const loadBoards = async (userCode: string) => {
    setIsLoading(true);
    try {
      const [boards, profile, payment] = await Promise.all([
        fetchBoards(),
        fetchUserProfile(),
        fetchUserPaymentStatus(),
      ]);
      setBoards(boards);
      setUserProfile(profile);
      setPaymentStatus(payment);
      setIsValidCode(true);
      setImageError(false); // Reset image error when new profile loads
      chrome.storage.local.set({ code: userCode });
      
      // Handle board selection logic
      if (boards.length > 0) {
        const { lastSelectedBoardId } = await chrome.storage.local.get('lastSelectedBoardId');
        const isValidSelection = boards.some(board => board._id === lastSelectedBoardId);
        
        if (!lastSelectedBoardId || !isValidSelection) {
          // No board selected or invalid selection - select the first board
          await chrome.storage.local.set({ lastSelectedBoardId: boards[0]._id });
          setLastSelectedBoardId(boards[0]._id);
        } else {
          // Valid selection exists
          setLastSelectedBoardId(lastSelectedBoardId);
        }
      } else {
        // No boards exist - clear any existing board selection
        await chrome.storage.local.set({ lastSelectedBoardId: null });
        setLastSelectedBoardId(null);
      }
    } catch (error) {
      setIsValidCode(false);
      setBoards([]);
      setUserProfile(null);
      setPaymentStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    chrome.storage.local.set({ code });
    e.preventDefault();
    loadBoards(code);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'LOGIN' });
      }
    });
  };

  const handleLogout = async () => {
    // Clear storage
    await chrome.storage.local.clear();

    // Reset local state
    setCode('');
    setIsValidCode(false);
    setBoards([]);
    setLastSelectedBoardId(null);
    setUserProfile(null);
    setPaymentStatus(null);
    setImageError(false);

    // Send logout message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'LOGOUT' });
      }
    });
  };

  const handleBoardClick = (boardId: string) => {
    setLastSelectedBoardId(boardId);
    chrome.storage.local.set({ lastSelectedBoardId: boardId });
  };

  const handleBoardRedirect = (boardId: string) => {
    const baseUrl = `${BASE_URL}/app`;
    const url = boardId ? `${baseUrl}?boardId=${boardId}` : baseUrl;
    window.open(url, '_blank');
  };

  const handleNewSticky = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      if (tabs[0]?.id) {
        const message: CreateStickyMessage = {
          type: 'CREATE_STICKY',
          data: {
            text: '',
            position: 'middle',
          },
        };

        chrome.tabs.sendMessage(tabs[0].id, message);
      }
    });
  };

  const handleNewBoard = () => {
    const isProUser = paymentStatus && 
      (paymentStatus.userType === USER_TYPE.MONTHLY_SUBSCRIPTION || 
       paymentStatus.userType === USER_TYPE.ONE_TIME_FULL_ACCESS) &&
      (paymentStatus.userType !== USER_TYPE.MONTHLY_SUBSCRIPTION || 
       paymentStatus.subscriptionLifeCycle === SUBSCRIPTION_LIFECYCLE.PAID);

    if (isProUser) {
      // Open dashboard with query parameter to show create board modal
      window.open(`${BASE_URL}/app?createBoard=true`, '_blank');
    } else {
      // Open pricing page for free users
      window.open('https://www.thestickyapp.com/pricing', '_blank');
    }
  };

  const handleSettingsToggle = async (setting: string, value: boolean) => {
    await chrome.storage.local.set({ [setting]: value });
    
    // Send message to content script to update settings
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'SETTINGS_UPDATED',
          data: { [setting]: value },
        });
      }
    });
  };

  useEffect(() => {
    chrome.storage.local.get(['code', 'lastSelectedBoardId', 'showDraggableIcon'], (result: any) => {
      console.log('Storage result:', result);
      if (result.code) {
        setCode(result.code);
        setIsValidCode(true);
        loadBoards(result.code);
      }
      // Clear any "null" string board IDs (from old Default board)
      if (result.lastSelectedBoardId === null || result.lastSelectedBoardId === 'null') {
        chrome.storage.local.set({ lastSelectedBoardId: null });
        setLastSelectedBoardId(null);
      } else {
        setLastSelectedBoardId(result.lastSelectedBoardId || null);
      }
      setShowDraggableIcon(result.showDraggableIcon !== false); // Default to true
    });
  }, []);

  // react to code saved from extension login tab
  useEffect(() => {
    const handler = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName !== 'local') return;
      if (changes.code && changes.code.newValue) {
        const newCode = changes.code.newValue as string;
        setCode(newCode);
        setIsValidCode(true);
        loadBoards(newCode);
      }
    };
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, []);

  return (
    <div className="App antialiased">
      <header className="header">
        <div className="logo-section">
          <Logo />

          <h1>STICKY</h1>
        </div>
        <div className="actions">
          <a href={`${BASE_URL}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="icon" size={20} />
          </a>
          <button
            onClick={() => setShowSettings((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Settings className="icon" size={20} />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-container">
          <div className="settings-header">
            <h3>Settings</h3>
          </div>
          <div className="settings-option">
            <div className="setting-info">
              <span className="setting-title">Show Draggable Button</span>
              <span className="setting-description">
                Display the floating sticky note button on web pages
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showDraggableIcon}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setShowDraggableIcon(newValue);
                  handleSettingsToggle('showDraggableIcon', newValue);
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      )}

      {!isValidCode ? (
        <div className="login-container">
          <button
            className="login-button"
            onClick={() => {
              chrome.tabs.create({ url: `${BASE_URL}/login/google?ext=1` });
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading…' : 'Sign in with Sticky'}
          </button>
          <p className="login-text">
            A new tab will open to securely sign in. It will close automatically once done.
          </p>
        </div>
      ) : (
        <div className="content">
          <div className="cards-container">
            <div className="action-card new-sticky" onClick={handleNewSticky}>
              <StickyNote size={24} />
              <span>Create New Sticky</span>
            </div>
            <div className="action-card new-board" onClick={handleNewBoard}>
              <Layout size={24} />
              <span>Create New Board</span>
              <div className="pro-badge">PRO</div>
            </div>
          </div>

          <div className={`board-list ${isLoading ? 'loading' : ''}`}>
            {isLoading ? (
              <>
                {/* Single skeleton loading placeholder */}
                <div className="board-skeleton">
                  <div className="skeleton-content">
                    <div className="skeleton-indicator"></div>
                    <div className="skeleton-text"></div>
                  </div>
                  <div className="skeleton-icon"></div>
                </div>
              </>
            ) : (
              <>
                {boards.length === 0 ? (
                  <div className="no-boards-message">
                    <span>No boards found. Create your first board!</span>
                  </div>
                ) : (
                  boards.map((board) => (
                    <div
                      key={board._id}
                      className={`board-item ${
                        board._id === lastSelectedBoardId ? 'selected' : ''
                      }`}
                      onClick={() => handleBoardClick(board._id)}
                    >
                      <div className="board-content">
                        <div className="board-indicator"></div>
                        <span className="board-name">{board.boardName}</span>
                      </div>
                      <ExternalLink
                        className="board-action"
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBoardRedirect(board._id);
                        }}
                      />
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          <div className="user-profile-container">
            {isLoading || !userProfile ? (
              <div className="user-skeleton" aria-hidden>
                <div className="skeleton-avatar" />
                <div className="skeleton-user-text">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line long" />
                </div>
                <div className="skeleton-button" />
              </div>
            ) : (
              <div className="user-profile">
                <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: !imageError && userProfile.picture ? 'none' : '#f0f0f0' }}>
                  {!imageError && userProfile.picture ? (
                    <img
                      src={userProfile.picture}
                      alt={userProfile.name}
                      onError={() => setImageError(true)}
                      style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
                    />
                  ) : (
                    <User size={20} style={{ color: '#666' }} />
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">{userProfile.name}</span>
                  <span className="user-email">{userProfile.email}</span>
                </div>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

function Logo() {
  return (
    <svg
      width="28"
      height="24"
      viewBox="0 0 28 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect width="28" height="24" fill="url(#pattern0_2032_6653)" />
      <defs>
        <pattern
          id="pattern0_2032_6653"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_2032_6653"
            transform="matrix(0.0126582 0 0 0.0147679 0 -0.0833333)"
          />
        </pattern>
        <image
          id="image0_2032_6653"
          width="79"
          height="79"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}