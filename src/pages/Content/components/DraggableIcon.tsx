import React, { useEffect, useRef, useState } from 'react';
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
  const [bounds, setBounds] = useState<{
    left: number;
    top: number;
    right: number;
    bottom: number;
  } | null>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);

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

  // Calculate bounds based on viewport size
  const calculateBounds = () => {
    if (!iconRef.current) return null;

    const iconRect = iconRef.current.getBoundingClientRect();
    const iconWidth = iconRect.width;
    const iconHeight = iconRect.height;

    return {
      left: 0,
      top: 0,
      right: window.innerWidth - iconWidth,
      bottom: window.innerHeight - iconHeight,
    };
  };

  // Constrain position within bounds
  const constrainPosition = (pos: { x: number; y: number }, bounds: { left: number; top: number; right: number; bottom: number }) => {
    return {
      x: Math.max(bounds.left, Math.min(bounds.right, pos.x)),
      y: Math.max(bounds.top, Math.min(bounds.bottom, pos.y)),
    };
  };

  // Update bounds when window resizes or icon is rendered
  useEffect(() => {
    const updateBounds = () => {
      const newBounds = calculateBounds();
      if (newBounds) {
        setBounds(newBounds);

        // Constrain current position to new bounds if position exists
        if (position) {
          const constrainedPosition = constrainPosition(position, newBounds);
          if (constrainedPosition.x !== position.x || constrainedPosition.y !== position.y) {
            setPosition(constrainedPosition);
            chrome.storage.local.set({ [STORAGE_KEY]: constrainedPosition });
          }
        }
      }
    };

    // Update bounds after a short delay to ensure icon is rendered
    const timeoutId = setTimeout(updateBounds, 100);

    // Add resize listener
    window.addEventListener('resize', updateBounds);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateBounds);
    };
  }, [position]); // Re-calculate when position changes (icon rendered)

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
    userSelect: 'none',
  };

  const handleClick = async (e: React.MouseEvent) => {
    // Only create note if we didn't actually drag
    if (!isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2 + window.scrollY;
      await createNote('', { x: centerX, y: centerY });
    }
  };

  const handleDragStart = (_e: any, data: { x: number; y: number }) => {
    isDragging.current = false;
    dragStartPos.current = { x: data.x, y: data.y };
  };

  const handleDrag = (_e: any, data: { x: number; y: number }) => {
    // Check if we've moved enough to consider this a drag
    if (dragStartPos.current) {
      const deltaX = Math.abs(data.x - dragStartPos.current.x);
      const deltaY = Math.abs(data.y - dragStartPos.current.y);
      if (deltaX > 5 || deltaY > 5) {
        isDragging.current = true;
      }
    }

    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    chrome.storage.local.set({ [STORAGE_KEY]: newPosition });
  };

  const handleDragStop = () => {
    // Reset the dragging flag after a short delay to allow click handler to read it
    setTimeout(() => {
      isDragging.current = false;
      dragStartPos.current = null;
    }, 10);
  };

  return position ? (
    <Draggable
      position={position}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      bounds={bounds || undefined}
    >
      <div
        ref={iconRef}
        style={iconStyle}
        className="draggable-sticky-icon"
        onClick={handleClick}
      >
        <BsSticky size={20} color="#4CAF50" />
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'black',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          New Sticky
        </span>
      </div>
    </Draggable>
  ) : null;
};

export default DraggableIcon;
