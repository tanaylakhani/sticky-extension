import React, { useState, useEffect } from 'react';
import Note from './Note';

interface StickyNote {
  id: string;
  position: {
    x: number;
    y: number;
  };
  text: string;
}

const StickyNotesContainer: React.FC = () => {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [lastClickCoords, setLastClickCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Capture right-click coordinates
    const handleContextMenu = (e: MouseEvent) => {
      setLastClickCoords({
        x: e.clientX,
        y: e.clientY,
      });
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  useEffect(() => {
    // Handle messages from background script
    const messageListener = (
      message: { type: string; data: { text: string } },
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.type === 'CREATE_STICKY') {
        const newNote: StickyNote = {
          id: `note-${Date.now()}`,
          position: {
            x: lastClickCoords.x - 10,
            y: lastClickCoords.y - 10,
          },
          text: message.data.text || '',
        };

        setNotes((prevNotes) => [...prevNotes, newNote]);
        sendResponse({ success: true });
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [lastClickCoords]);

  const handleClose = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  return (
    <>
      {notes.map((note) => (
        <Note
          key={note.id}
          id={note.id}
          position={note.position}
          initialText={note.text}
          onClose={handleClose}
        />
      ))}
    </>
  );
};

export default StickyNotesContainer;
