import React, { useState, useEffect, useRef } from 'react';
import './Sticky.css';

const Sticky = ({ initialText = '', position, onClose }) => {
  const [text, setText] = useState(initialText);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const stickyRef = useRef(null);

  useEffect(() => {
    if (stickyRef.current) {
      stickyRef.current.style.left = `${position.x}px`;
      stickyRef.current.style.top = `${position.y}px`;
    }
  }, [position]);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('sticky-header')) {
      setIsDragging(true);
      const rect = stickyRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && stickyRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      stickyRef.current.style.left = `${newX}px`;
      stickyRef.current.style.top = `${newY}px`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div ref={stickyRef} className="sticky-note" onMouseDown={handleMouseDown}>
      <div className="sticky-header">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your note here..."
      />
    </div>
  );
};

export default Sticky;
