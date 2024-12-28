import React, { useState, useRef } from 'react';
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
import { FaBold, FaItalic, FaListUl, FaUnderline } from 'react-icons/fa';
import Tiptap from './Tiptap';

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
  const [isTextAreaInFocus, setIsTextAreaInFocus] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(position);
  const noteRef = useRef<HTMLDivElement>(null);

  // Convert string content to TipTap JSON format
  const initialContent = {
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
  };

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
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Get content as JSON
      const json = editor.getJSON();
      console.log('Content updated:', json);
    },
  });

  const handleDrag = (_e: any, data: { x: number; y: number }) => {
    setCurrentPosition({ x: data.x, y: data.y });
  };

  return (
    <Draggable
      handle=".note-header"
      defaultPosition={position}
      onDrag={handleDrag}
      bounds="body"
    >
      <div
        ref={noteRef}
        className={`sticky-note ${isTextAreaInFocus ? 'focused' : ''}`}
      >
        <div className="note-header">
          <div className="coordinates">
            x: {Math.round(currentPosition.x)}, y:{' '}
            {Math.round(currentPosition.y)}
          </div>
          <button className="close-button" onClick={() => onClose(id)}>
            ×
          </button>
        </div>

        {editor && (
          <>
            <Tiptap
              editor={editor}
              setIsTextAreaInFocus={setIsTextAreaInFocus}
              data={{ content: initialContent }}
              color="inherit"
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
            </div>
          </>
        )}
      </div>
    </Draggable>
  );
};

export default Note;
