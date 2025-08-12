import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  FaCompressAlt,
  FaEllipsisV,
  FaExpandAlt,
  FaImage,
  FaItalic,
  FaListUl,
  FaTrash,
  FaUnderline,
} from 'react-icons/fa';
import Tiptap from './Tiptap';
import { updateNote, uploadImage } from '../../../services/api';
import debounce from 'lodash/debounce';
import { StickyNote } from '../../../types';
import { INoteSize } from '../../../enums';
import { playBubbleSound, playOinkSound } from '../utils/soundUtils';

// import bubbleSound from '../../../assets/sounds/bubble.wav';

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
  size?: INoteSize;
  onOptimisticDelete: (noteId: string) => Promise<void>;
  onPositionChange?: (noteId: string, position: { x: number; y: number }) => void;
}

const Note: React.FC<NoteProps> = ({
  initialText = '',
  loadNotes,
  note,
  boards,
  onOptimisticDelete,
  onPositionChange,
}) => {
  const [isTextAreaInFocus, setIsTextAreaInFocus] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(note.position);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [localColor, setLocalColor] = useState(note.color);
  const [isDragging, setIsDragging] = useState(false);

  // Sync currentPosition with note.position when it changes (e.g., after reload)
  // But only if we're not currently dragging to avoid conflicts
  useEffect(() => {
    if (!isDragging) {
      setCurrentPosition(note.position);
    }
  }, [note.position, isDragging]);

  // Sync currentSize with note.size when it changes
  useEffect(() => {
    setCurrentSize(note.size || INoteSize.SMALL);
  }, [note.size]);
  const noteRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentSize, setCurrentSize] = useState(note.size || INoteSize.SMALL);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const [isClicking, setIsClicking] = useState(false);

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
    try {
      await updateNote(note.id, {
        websiteUrl: window.location.href,
        boardId,
        data: {
          type: 'note',
          position: currentPosition,
          data: {
            content: editor?.getJSON(),
            color: localColor,
            title: '',
          },
        },
      });
      chrome.storage.local.set({ lastSelectedBoardId: boardId });
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
            data: {
              content: content,
              color: localColor,
              title: '',
            },
          },
        });
        // Parent state already updated during drag - no need to update again
      } catch (error) {
        console.error('Error updating note:', error);
      }
    }, 1000),
    [note.id, localColor]
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
    
    // Immediately update parent state to prevent flickering
    onPositionChange?.(note.id, newPosition);
    
    // Also update server in background
    debouncedUpdate(editor?.getJSON(), newPosition);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const data = await uploadImage(file);
      editor?.chain().focus().setImage({ src: data.url }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    // Use optimistic delete - note will be removed from UI immediately
    // and restored if the server call fails
    await onOptimisticDelete(id);
  };

  const handleColorChange = async (id: string, newColor: string) => {
    // Immediately update local state
    setLocalColor(newColor);

    try {
      await updateNote(id, {
        websiteUrl: window.location.href,
        data: {
          type: 'note',
          position: currentPosition,
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
      // Revert to previous color on error
      setLocalColor(note.color);
    }
  };

  // Update useEffect to sync localColor with note.color when it changes from parent
  useEffect(() => {
    setLocalColor(note.color);
  }, [note.color]);

  const handleSizeToggle = async () => {
    const newSize =
      currentSize === INoteSize.SMALL ? INoteSize.LARGE : INoteSize.SMALL;
    setCurrentSize(newSize);

    try {
      await updateNote(note.id, {
        websiteUrl: window.location.href,
        data: {
          type: 'note',
          position: currentPosition,
          data: {
            content: editor?.getJSON(),
            color: localColor,
            title: '',
            size: newSize,
          },
        },
      });
      await loadNotes();
    } catch (error) {
      console.error('Error updating note size:', error);
      setCurrentSize(currentSize); // Revert on error
    }
  };

  return (
    <Draggable
      position={currentPosition}
      onDrag={(e, data) => {
        setIsDragging(true);
        handleDrag(e, data);
      }}
      onStart={() => {
        setIsDragging(true);
      }}
      onStop={() => {
        setIsDragging(false);
      }}
    >
      <div
        ref={noteRef}
        className={`sticky-note ${localColor} ${isTextAreaInFocus ? 'focused' : ''
          } ${currentSize}`}
      >
                <div className="note-header">
          <div className="note-header-left">
            <div className="color-menu-container" ref={colorMenuRef}>
              <button
                className="color-picker-button"
                onClick={() => {
                  playBubbleSound();
                  setShowColorMenu(!showColorMenu);
                }}
                onMouseEnter={playOinkSound}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  backgroundColor:
                    colorMap[localColor as keyof typeof colorMap],
                }}
                title="Change color"
              />
              {showColorMenu && (
                <div className="color-menu">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`color-menu-item ${color === localColor ? 'active' : ''
                        }`}
                      style={{
                        backgroundColor:
                          colorMap[color as keyof typeof colorMap],
                      }}
                      onClick={(e) => {
                        playBubbleSound();
                        e.stopPropagation(); // Prevent event from bubbling up
                        handleColorChange(note.id, color);
                        setShowColorMenu(false);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="board-menu-container" ref={menuRef}>
              <button
                className="board-menu-button"
                onClick={() => {
                  playBubbleSound();
                  setShowBoardMenu(!showBoardMenu);
                }}
                onMouseEnter={playOinkSound}
                onMouseDown={(e) => e.stopPropagation()}
                title="Select board"
              >
                <FaEllipsisV />
              </button>
              {showBoardMenu && (
                <div className="board-menu">
                  {boards.map((board) => (
                    <button
                      key={board.id}
                      className={`board-menu-item ${note.boardId === board.id ? 'active' : ''
                        }`}
                      onClick={() => {
                        playBubbleSound();
                        handleBoardSelect(board.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {board.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className="resize-button-container"
              title={currentSize === INoteSize.SMALL ? 'Expand' : 'Shrink'}
            >
              <button
                className="resize-button"
                onClick={() => {
                  setIsClicking(true);
                  playBubbleSound();
                  handleSizeToggle();
                  // Reset after a short delay
                  setTimeout(() => setIsClicking(false), 100);
                }}
                onMouseEnter={() => {
                  if (!isClicking) {
                    playOinkSound();
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {currentSize === INoteSize.SMALL ? (
                  <FaExpandAlt />
                ) : (
                  <FaCompressAlt />
                )}
              </button>
            </div>
          </div>
          
          <button
            className="close-button"
            onClick={() => {
              playBubbleSound();
              handleDeleteNote(note.id);
            }}
            onMouseEnter={playOinkSound}
            onMouseDown={(e) => e.stopPropagation()}
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
              isUploading={isUploading}
            />
            <div className="editor-toolbar">
              <button
                onClick={() => {
                  playBubbleSound();
                  editor.chain().focus().toggleBold().run();
                }}
                onMouseEnter={playOinkSound}
                className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''
                  }`}
              >
                <FaBold />
              </button>
              <button
                onClick={() => {
                  playBubbleSound();
                  editor.chain().focus().toggleItalic().run();
                }}
                onMouseEnter={playOinkSound}
                className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''
                  }`}
              >
                <FaItalic />
              </button>
              <button
                onClick={() => {
                  playBubbleSound();
                  editor.chain().focus().toggleUnderline().run();
                }}
                onMouseEnter={playOinkSound}
                className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''
                  }`}
              >
                <FaUnderline />
              </button>
              <button
                onClick={() => {
                  playBubbleSound();
                  editor.chain().focus().toggleBulletList().run();
                }}
                onMouseEnter={playOinkSound}
                className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''
                  }`}
              >
                <FaListUl />
              </button>
              <button
                onClick={() => {
                  playBubbleSound();
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
                onMouseEnter={playOinkSound}
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