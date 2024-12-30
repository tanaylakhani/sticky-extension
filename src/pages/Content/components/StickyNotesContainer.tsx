import React, { useState, useEffect } from 'react';
import Note from './Note';
import { v4 as uuidv4 } from 'uuid';
import { fetchNotes, createNote, fetchBoards } from '../../../services/api';
import { StickyNote, TipTapContent } from '../../../types';

interface Board {
  id: string;
  name: string;
}

const StickyNotesContainer: React.FC = () => {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [notesToRender, setNotesToRender] = useState<StickyNote[]>([]);
  const [lastClickCoords, setLastClickCoords] = useState({ x: 0, y: 0 });
  const [currentUrl, setCurrentUrl] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);

  const loadBoards = async () => {
    try {
      const data = await fetchBoards();
      const formattedBoards = data.map((board: any) => ({
        id: board._id,
        name: board.boardName,
      }));
      setBoards(formattedBoards);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();

      const notes = data.map((note: any) => ({
        id: note.data.id,
        position: note.data.position_on_webpage,
        text: note.data.data.content,
        color: note.data.data.color,
        websiteUrl: note.websiteUrl,
        boardId: note.boardId,
      }));
      setNotes(notes);

      const notesForCurrentUrl = notes.filter(
        (note: any) => note.websiteUrl === window.location.href
      );
      setNotesToRender(notesForCurrentUrl);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

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

      const { lastSelectedBoardId } = await chrome.storage.local.get(
        'lastSelectedBoardId'
      );

      await createNote({
        websiteUrl: window.location.href,
        boardId: lastSelectedBoardId || null,
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

  const resetState = () => {
    setNotes([]);
    setNotesToRender([]);
    setCurrentUrl('');
    setBoards([]);
  };

  useEffect(() => {
    // Handle messages from background script
    const messageListener = (
      message: { type: string; data?: { text?: string; url?: string } },
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.type === 'LOGOUT') {
        resetState();
      }

      if (message.type === 'LOGIN') {
        loadNotes();
        loadBoards();
      }

      if (message.type === 'CREATE_STICKY') {
        // Create note on server first
        createNoteOnServer(message.data?.text || '')
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

      if (message.type === 'UPDATE_URL') {
        setCurrentUrl(message.data?.url || '');
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [lastClickCoords]);

  useEffect(() => {
    loadNotes();
    loadBoards();

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

  useEffect(() => {
    setNotesToRender(notes.filter((note) => note.websiteUrl === currentUrl));
  }, [currentUrl]);

  return (
    <>
      {notesToRender.map((note) => (
        <Note
          key={note.id}
          id={note.id}
          position={note.position}
          initialText={note.text}
          color={note.color}
          loadNotes={loadNotes}
          note={note}
          boards={boards}
        />
      ))}
    </>
  );
};

export default StickyNotesContainer;
