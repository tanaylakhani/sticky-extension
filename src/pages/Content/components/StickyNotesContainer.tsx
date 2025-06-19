import React, { useState, useEffect } from 'react';
import Note from './Note';
import DraggableIcon from './DraggableIcon';
import { v4 as uuidv4 } from 'uuid';
import { fetchNotes, createNote, fetchBoards, deleteNote } from '../../../services/api';
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
      const formattedBoards = data?.map((board: any) => ({
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
      if (!data) return;

      const notes = data?.map((note: any) => ({
        id: note.data.id || note.id,
        position: note.data.position,
        text: note.data.data.content,
        color: note.data.data.color,
        websiteUrl: note.websiteUrl,
        boardId: note.boardId,
        size: note.data.data.size,
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

  const createNoteOnServer = async (
    text: string,
    position: { x: number; y: number }
  ) => {
    try {
      const noteId = uuidv4();

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

  // Optimistic delete: remove note from state immediately
  const handleOptimisticDelete = async (noteId: string) => {
    // Store the deleted note for potential rollback
    const deletedNote = notes.find(note => note.id === noteId);
    if (!deletedNote) return;

    // Optimistically remove from state immediately
    const filteredNotes = notes.filter(note => note.id !== noteId);
    setNotes(filteredNotes);

    const filteredNotesToRender = filteredNotes.filter(
      note => note.websiteUrl === window.location.href
    );
    setNotesToRender(filteredNotesToRender);

    // Attempt to delete on server
    try {
      await deleteNote(noteId);
      // Success - the optimistic update was correct, nothing more to do
    } catch (error) {
      console.error('Error deleting note:', error);
      // Rollback: restore the note to state
      setNotes(prevNotes => [...prevNotes, deletedNote]);
      setNotesToRender(prevNotes => {
        const allNotes = [...prevNotes, deletedNote];
        return allNotes.filter(note => note.websiteUrl === window.location.href);
      });
    }
  };

  useEffect(() => {
    // Handle messages from background script
    const messageListener = (
      message: {
        type: string;
        data?: {
          text?: string;
          url?: string;
          position?: { x: number; y: number };
          code?: string;
        };
      },
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
        let position = message.data?.position || {
          x: lastClickCoords.x - 10,
          y: lastClickCoords.y - 10,
        };

        if (typeof position === 'string' && position === 'middle') {
          position = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2 + window.scrollY,
          };
        }

        // Create note on server first
        createNoteOnServer(message.data?.text || '', position)
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
        console.log('UPDATE_URL', message.data?.url);
        setCurrentUrl(message.data?.url || '');
      }

      if (message.type === 'CODE_DETECTED') {
        if (message.data?.code) {
          chrome.storage.local.set({ code: message.data?.code });
        }
      }
    };

    console.log({ lastClickCoords });
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
    if (!currentUrl) return;

    console.log({ currentUrl });
    // if(currentUrl.includes('/extension/code'))

    setNotesToRender(notes.filter((note) => note.websiteUrl === currentUrl));
  }, [currentUrl]);

  return (
    <>
      <DraggableIcon
        createNote={async (text, position) => {
          const success = await createNoteOnServer(text, position);
          if (success) {
            await loadNotes();
          }
          return success;
        }}
      />
      {notesToRender?.map((note) => (
        <Note
          key={note.id}
          id={note.id}
          position={note.position}
          initialText={note.text}
          color={note.color}
          loadNotes={loadNotes}
          note={note}
          boards={boards}
          onOptimisticDelete={handleOptimisticDelete}
        />
      ))}
    </>
  );
};

export default StickyNotesContainer;
