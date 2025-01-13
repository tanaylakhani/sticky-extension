import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { BsSticky } from 'react-icons/bs';
import './DraggableIcon.css';

interface DraggableIconProps {
  createNote: (
    text: string,
    position: { x: number; y: number }
  ) => Promise<boolean>;
}

const STORAGE_KEY = 'draggableIconPosition';

const DraggableIcon: React.FC<DraggableIconProps> = ({ createNote }) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const isDragging = useRef(false);

  useEffect(() => {
    // Load position from chrome storage
    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      setPosition(result[STORAGE_KEY] || { x: 20, y: 20 });
    });

    // Listen for changes in other tabs
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[STORAGE_KEY]) {
        setPosition(changes[STORAGE_KEY].newValue);
      }
    });
  }, []);

  const iconStyle: React.CSSProperties = {
    position: 'fixed',
    cursor: 'move',
    background: '#ffffff',
    padding: '10px 15px',
    borderRadius: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const handleClick = async () => {
    if (!isDragging.current) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2 + window.scrollY;
      await createNote('', { x: centerX, y: centerY });
    }
  };

  const handleDrag = (_e: any, data: { x: number; y: number }) => {
    isDragging.current = true;
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    chrome.storage.local.set({ [STORAGE_KEY]: newPosition });
  };

  const handleDragStop = () => {
    // Reset the dragging flag after a short delay
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  };

  return position ? (
    <Draggable
      position={position}
      onDrag={handleDrag}
      onStop={handleDragStop}
      bounds="body"
    >
      <div
        style={iconStyle}
        className="draggable-sticky-icon"
        onClick={handleClick}
      >
        <BsSticky size={20} color="#4CAF50" />
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'black' }}>
          New Sticky
        </span>
      </div>
    </Draggable>
  ) : null;
};

export default DraggableIcon;
