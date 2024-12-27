import React, { useState } from 'react';
import Draggable from 'react-draggable';

interface NoteProps {
  id: string;
  initialText: string;
  position: {
    x: number;
    y: number;
  };
  onClose: (id: string) => void;
}

const Note: React.FC<NoteProps> = ({
  id,
  initialText = '',
  position,
  onClose,
}) => {
  const [text, setText] = useState(initialText);
  const [currentPosition, setCurrentPosition] = useState(position);

  const handleDrag = (_e: any, data: { x: number; y: number }) => {
    setCurrentPosition({ x: Math.round(data.x), y: Math.round(data.y) });
  };

  return (
    <Draggable
      handle=".note-header"
      defaultPosition={position}
      onDrag={handleDrag}
      bounds="body"
    >
      <div className="sticky-note">
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
    </Draggable>
  );
};

export default Note;
