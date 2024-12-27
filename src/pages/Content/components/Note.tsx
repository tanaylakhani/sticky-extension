import React, { useState, useEffect, useRef } from 'react';
import './Note.css';

interface NoteProps {
  id: string;
  initialText: string;
  position: {
    x: number;
    y: number;
  };
  onClose: (id: string) => void;
}

interface DragOffset {
  x: number;
  y: number;
}

const Note: React.FC<NoteProps> = ({
  id,
  initialText = '',
  position,
  onClose,
}) => {
  const [text, setText] = useState(initialText);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (noteRef.current) {
      noteRef.current.style.left = `${position.x}px`;
      noteRef.current.style.top = `${position.y}px`;
      setCurrentPosition(position);
    }
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains('note-header')) {
      setIsDragging(true);
      const rect = noteRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && noteRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      noteRef.current.style.left = `${newX}px`;
      noteRef.current.style.top = `${newY}px`;
      setCurrentPosition({ x: Math.round(newX), y: Math.round(newY) });
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
    <div ref={noteRef} className="sticky-note" onMouseDown={handleMouseDown}>
      <div className="note-header">
        <div className="coordinates">
          x: {currentPosition.x}, y: {currentPosition.y}
        </div>
        <button className="close-button" onClick={() => onClose(id)}>
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

export default Note;
