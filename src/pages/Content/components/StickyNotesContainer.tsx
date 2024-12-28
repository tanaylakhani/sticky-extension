import React, { useState, useEffect } from 'react';
import Note from './Note';
import { v4 as uuidv4 } from 'uuid';

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

  // Fetch existing notes when component mounts
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(
          'http://localhost:3000/api/notes/v2/extension?code=p5yqdd'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }

        const data = await response.json();
        console.log(data);
        // Convert server notes to local format
        const existingNotes = data
          .filter((note: any) => note.websiteUrl === window.location.href)
          .map((note: any) => ({
            id: note.data.id,
            position: note.data.position_on_webpage,
            text: note.data.data.content,
          }));
        console.log(existingNotes);

        setNotes(existingNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    // Capture right-click coordinates
    const handleContextMenu = (e: MouseEvent) => {
      setLastClickCoords({
        x: e.pageX,
        y: e.pageY,
      });
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const createNoteOnServer = async (text: string) => {
    try {
      const noteId = uuidv4();
      const position = {
        x: lastClickCoords.x - 10,
        y: lastClickCoords.y - 10,
      };

      const response = await fetch(
        'http://localhost:3000/api/notes/v2/extension',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: 'p5yqdd',
            note: {
              websiteUrl: window.location.href,
              data: {
                id: noteId,
                type: 'note',
                position: position,
                positionAbsolute: position,
                position_on_webpage: position,
                data: {
                  content: text,
                  color: 'GREEN',
                  title: '',
                },
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create note on server');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  };

  useEffect(() => {
    // Handle messages from background script
    const messageListener = (
      message: { type: string; data: { text: string } },
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.type === 'CREATE_STICKY') {
        // Create note on server first
        createNoteOnServer(message.data.text || '')
          .then((serverResponse) => {
            if (serverResponse) {
              const newNote: StickyNote = {
                id: serverResponse.data.id,
                position: {
                  x: lastClickCoords.x - 10,
                  y: lastClickCoords.y - 10,
                },
                text: message.data.text || '',
              };

              setNotes((prevNotes) => [...prevNotes, newNote]);
              sendResponse({ success: true });
            } else {
              sendResponse({ success: false });
            }
          })
          .catch((error) => {
            console.error('Error handling message:', error);
            sendResponse({ success: false });
          });

        // Return true to indicate we will send response asynchronously
        return true;
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
