import React, { useState, useRef, useCallback, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import {
  FaBold,
  FaItalic,
  FaListUl,
  FaUnderline,
  FaImage,
  FaTrash,
  FaEllipsisV,
} from 'react-icons/fa';
import Tiptap from './Tiptap';
import { uploadImage, updateNote, deleteNote } from '../services/api';
import debounce from 'lodash/debounce';
import { StickyNote } from '../../../types';

interface Board {
  id: string;
  name: string;
}

interface NoteProps {
  id: string;
  initialText:
    | string
    | {
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
      };
  position: {
    x: number;
    y: number;
  };
  color?: string;
  loadNotes: () => Promise<void>;
  note: StickyNote;
  boards: Board[];
}

const Note: React.FC<NoteProps> = ({
  initialText = '',
  loadNotes,
  note,
  boards,
}) => {
  const [isTextAreaInFocus, setIsTextAreaInFocus] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(note.position);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const colors = ['GREEN', 'BLUE', 'RED', 'YELLOW', 'PURPLE', 'GRAY'];

  const colorMap = {
    GREEN: '#2a5a35',
    BLUE: '#1a4971',
    RED: '#8b3f1d',
    YELLOW: '#8b6534',
    PURPLE: '#5b3a80',
    GRAY: '#3e4e5e',
  };

  const handleBoardSelect = async (boardId: string) => {
    console.log('updating board', boardId);
    try {
      await updateNote(note.id, {
        websiteUrl: window.location.href,
        boardId,
        data: {
          type: 'note',
          position: currentPosition,
          positionAbsolute: currentPosition,
          position_on_webpage: currentPosition,
          data: {
            content: editor?.getJSON(),
            color: note.color,
            title: '',
          },
        },
      });
      await loadNotes();
      setShowBoardMenu(false);
    } catch (error) {
      console.error('Error updating note board:', error);
    }
  };

  // Convert string content to TipTap JSON format or use existing JSON content
  const initialContent =
    typeof initialText === 'string'
      ? {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: initialText,
                },
              ],
            },
          ],
        }
      : { type: 'doc', content: initialText.content };

  // Debounced update function to prevent too many API calls
  const debouncedUpdate = useCallback(
    debounce(async (content: any, position: { x: number; y: number }) => {
      try {
        await updateNote(note.id, {
          websiteUrl: window.location.href,
          data: {
            type: 'note',
            position: position,
            positionAbsolute: position,
            position_on_webpage: position,
            data: {
              content: content,
              color: note.color,
              title: '',
            },
          },
        });
        loadNotes();
      } catch (error) {
        console.error('Error updating note:', error);
      }
    }, 1000),
    [note.id, note.color]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
      Link.configure({
        openOnClick: false,
      }),
      Bold,
      Italic,
      Underline,
      BulletList,
      ListItem,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      debouncedUpdate(json, currentPosition);
    },
  });

  const handleDrag = (_e: any, data: { x: number; y: number }) => {
    const newPosition = { x: data.x, y: data.y };
    setCurrentPosition(newPosition);
    debouncedUpdate(editor?.getJSON(), newPosition);
  };

  const handleImageUpload = async (file: File) => {
    try {
      const data = await uploadImage(file);
      editor?.chain().focus().setImage({ src: data.url }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleColorChange = async (id: string, newColor: string) => {
    try {
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
    } catch (error) {
      console.error('Error updating note color:', error);
    }
  };

  const handleColorClick = () => {
    const currentIndex = colors.indexOf(note.color);
    const nextIndex = (currentIndex + 1) % colors.length;
    handleColorChange(note.id, colors[nextIndex]);
  };

  return (
    <Draggable
      handle=".note-header"
      defaultPosition={note.position}
      onDrag={handleDrag}
      bounds="body"
    >
      <div
        ref={noteRef}
        className={`sticky-note ${note.color} ${
          isTextAreaInFocus ? 'focused' : ''
        }`}
      >
        <div className="note-header">
          <div className="note-header-left">
            <button
              className="color-picker-button"
              onClick={handleColorClick}
              style={{
                backgroundColor: colorMap[note.color as keyof typeof colorMap],
              }}
              title="Change color"
            />
            <div className="board-menu-container" ref={menuRef}>
              <button
                className="board-menu-button"
                onClick={() => setShowBoardMenu(!showBoardMenu)}
                title="Select board"
              >
                <FaEllipsisV />
              </button>
              {showBoardMenu && (
                <div className="board-menu">
                  {boards.map((board) => (
                    <button
                      key={board.id}
                      className={`board-menu-item ${
                        note.boardId === board.id ? 'active' : ''
                      }`}
                      onClick={() => handleBoardSelect(board.id)}
                    >
                      {board.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            className="close-button"
            onClick={() => handleDeleteNote(note.id)}
          >
            <FaTrash />
          </button>
        </div>

        {editor && (
          <>
            <Tiptap
              editor={editor}
              setIsTextAreaInFocus={setIsTextAreaInFocus}
              data={{ content: initialContent }}
              color="inherit"
              id={note.id}
            />
            <div className="editor-toolbar">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`toolbar-button ${
                  editor.isActive('bold') ? 'active' : ''
                }`}
              >
                <FaBold />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`toolbar-button ${
                  editor.isActive('italic') ? 'active' : ''
                }`}
              >
                <FaItalic />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`toolbar-button ${
                  editor.isActive('underline') ? 'active' : ''
                }`}
              >
                <FaUnderline />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`toolbar-button ${
                  editor.isActive('bulletList') ? 'active' : ''
                }`}
              >
                <FaListUl />
              </button>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  };
                  input.click();
                }}
                className="toolbar-button"
              >
                <FaImage />
              </button>
            </div>
          </>
        )}
      </div>
    </Draggable>
  );
};

export default Note;
