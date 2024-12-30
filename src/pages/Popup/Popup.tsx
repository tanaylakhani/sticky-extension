import React, { useEffect, useState } from 'react';
import './Popup.css';
import { fetchBoards } from '../../services/api';
import { Board } from '../../types';
const Popup = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [lastSelectedBoardId, setLastSelectedBoardId] = useState<string | null>(
    null
  );
  const [code, setCode] = useState<string>('');
  const [isValidCode, setIsValidCode] = useState<boolean>(false);

  const loadBoards = async (userCode: string) => {
    try {
      const boards = await fetchBoards();
      setBoards(boards);
      setIsValidCode(true);
      chrome.storage.local.set({ code: userCode });
    } catch (error) {
      setIsValidCode(false);
      setBoards([]);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    chrome.storage.local.set({ code });
    e.preventDefault();
    loadBoards(code);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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

    // Send logout message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'LOGOUT' });
      }
    });
  };

  useEffect(() => {
    chrome.storage.local.get(['code', 'lastSelectedBoardId'], (result) => {
      console.log(result);
      if (result.code) {
        setCode(result.code);
        setIsValidCode(true);
        loadBoards(result.code);
      }
      setLastSelectedBoardId(result.lastSelectedBoardId || null);
    });
  }, []);

  return (
    <div className="App">
      <h1>Sticky Notes</h1>
      {!isValidCode ? (
        <div>
          <form onSubmit={handleCodeSubmit}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code"
            />
            <button type="submit">Submit</button>
          </form>
          <p>
            Login to{' '}
            <a href="https://thestickyapp.com" target="_blank">
              sticky web app
            </a>
          </p>{' '}
          to get the code.
        </div>
      ) : (
        <div className="board-list">
          {boards.map((board) => (
            <div
              key={board._id}
              className={
                board._id === lastSelectedBoardId ? 'last-selected' : ''
              }
            >
              {board.boardName}
            </div>
          ))}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Popup;
