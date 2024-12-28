import React, { useState, useEffect } from 'react';
import Note from './Note';
import { v4 as uuidv4 } from 'uuid';
import {
  fetchNotes,
  createNote,
  deleteNote,
  updateNote,
} from '../services/api';

interface TipTapContent {
  type: string;
  content: Array<{
    type: string;
    content?: Array<{
      type: string;
      text?: string;
      attrs?: {
        src?: string;
        alt?: string | null;
        title?: string | null;
      };
    }>;
  }>;
}

interface StickyNote {
  id: string;
  position: {
    x: number;
    y: number;
  };
  text: string | TipTapContent;
  color: string;
}

const StickyNotesContainer: React.FC = () => {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [lastClickCoords, setLastClickCoords] = useState({ x: 0, y: 0 });

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();
      // Convert server notes to local format
      const existingNotes = data
        .filter((note: any) => note.websiteUrl === window.location.href)
        .map((note: any) => ({
          id: note.data.id,
          position: note.data.position_on_webpage,
          text: note.data.data.content,
          color: note.data.data.color,
        }));

      setNotes(existingNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  // Fetch existing notes when component mounts
  useEffect(() => {
    loadNotes();
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

      // Create TipTap JSON content
      const content: TipTapContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: text,
              },
            ],
          },
        ],
      };

      await createNote({
        websiteUrl: window.location.href,
        data: {
          id: noteId,
          type: 'note',
          position: position,
          positionAbsolute: position,
          position_on_webpage: position,
          data: {
            content: content,
            color: 'GREEN',
            title: '',
          },
        },
      });

      return true;
    } catch (error) {
      console.error('Error creating note:', error);
      return false;
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
          .then((success) => {
            if (success) {
              // Refetch all notes after successful creation
              loadNotes().then(() => {
                sendResponse({ success: true });
              });
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

  const handleClose = async (id: string) => {
    try {
      await deleteNote(id);
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleColorChange = async (id: string, newColor: string) => {
    try {
      const note = notes.find((n) => n.id === id);
      if (note) {
        await updateNote(id, {
          websiteUrl: window.location.href,
          data: {
            type: 'note',
            position: note.position,
            positionAbsolute: note.position,
            position_on_webpage: note.position,
            data: {
              content: note.text,
              color: newColor,
              title: '',
            },
          },
        });
        await loadNotes();
      }
    } catch (error) {
      console.error('Error updating note color:', error);
    }
  };

  return (
    <>
      {notes.map((note) => (
        <Note
          key={note.id}
          id={note.id}
          position={note.position}
          initialText={note.text}
          color={note.color}
          onClose={handleClose}
          onColorChange={handleColorChange}
        />
      ))}
    </>
  );
};

export default StickyNotesContainer;
