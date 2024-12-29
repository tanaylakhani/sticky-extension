import React, { useEffect, useState } from 'react';
import './Popup.css';
import { fetchBoards } from '../../services/api';
import { Board } from '../../types';
const Popup = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [lastSelectedBoardId, setLastSelectedBoardId] = useState<string | null>(
    null
  );

  const loadBoards = async () => {
    const boards = await fetchBoards();
    setBoards(boards);
  };

  useEffect(() => {
    loadBoards();

    chrome.storage.local.get(['lastSelectedBoardId'], (result) => {
      console.log(result);
      setLastSelectedBoardId(result.lastSelectedBoardId || null);
    });
  }, []);

  return (
    <div className="App">
      <h1>Sticky Notes</h1>
      <div className="board-list">
        {boards.map((board) => (
          <div
            key={board._id}
            className={board._id === lastSelectedBoardId ? 'last-selected' : ''}
          >
            {board.boardName}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Popup;
