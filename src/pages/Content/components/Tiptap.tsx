import React, { useEffect, useState, useCallback } from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import { FaTimesCircle } from 'react-icons/fa';
import { deleteImage } from '../services/api';
import { extractPublicIdFromUrl } from '../utils/imageUtils';

interface TiptapProps {
  editor: Editor;
  setIsTextAreaInFocus: (value: boolean) => void;
  data: {
    content: any;
  };
  color: string;
  id: string;
}

const Tiptap: React.FC<TiptapProps> = ({
  editor,
  setIsTextAreaInFocus,
  data,
  color,
  id,
}) => {
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(
    null
  );

  useEffect(() => {
    const handleKeyDown = (e: Event) => {
      e.stopPropagation();
    };

    const editorElement = document.querySelector(`[data-note-id="${id}"]`);
    if (editorElement) {
      editorElement.addEventListener('keydown', handleKeyDown, true);
      editorElement.addEventListener('keyup', handleKeyDown, true);
      editorElement.addEventListener('keypress', handleKeyDown, true);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener('keydown', handleKeyDown, true);
        editorElement.removeEventListener('keyup', handleKeyDown, true);
        editorElement.removeEventListener('keypress', handleKeyDown, true);
      }
    };
  }, [id]);

  const handleImageSelection = useCallback(() => {
    setSelectedImage(null);
    if (!editor) return;
    const { view, state } = editor;
    const { from } = state.selection;
    const node = view.nodeDOM(from) as HTMLElement;
    if (!node) return;
    if (node?.tagName === 'IMG') {
      setSelectedImage(node as HTMLImageElement);
      node.style.border = `2px solid ${color}`;
      node.style.borderRadius = '6px';
    } else {
      if (selectedImage) {
        selectedImage.style.border = 'none';
        selectedImage.style.borderRadius = '0';
      }
    }
  }, [editor, selectedImage, color]);

  const removeImage = useCallback(() => {
    if (!editor || !selectedImage) return;

    const imageUrl = selectedImage.getAttribute('src');
    console.log('imageUrl', imageUrl);
    if (imageUrl) {
      const publicId = extractPublicIdFromUrl(imageUrl);
      if (publicId) {
        deleteImage(publicId).catch((error) => {
          console.error('Error deleting image:', error);
        });
      }
    }

    const { state, view } = editor;
    const { from, to } = state.selection;
    view.dispatch(view.state.tr.delete(from, to));
    setSelectedImage(null);
  }, [editor, selectedImage]);

  useEffect(() => {
    if (editor) {
      editor.on('selectionUpdate', handleImageSelection);
      return () => {
        editor.off('selectionUpdate', handleImageSelection);
      };
    }
  }, [editor, handleImageSelection]);

  return (
    <div
      className="editor-container"
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onKeyPress={(e) => e.stopPropagation()}
    >
      {selectedImage && (
        <button
          onClick={removeImage}
          style={{
            position: 'absolute',
            top: '10px',
            right: '32px',
            padding: '4px',
            borderRadius: '4px',
            cursor: 'pointer',
            color: color,
            background: 'none',
            border: 'none',
          }}
        >
          <FaTimesCircle size={16} />
        </button>
      )}
      <EditorContent
        editor={editor}
        data-note-id={id}
        onFocus={() => setIsTextAreaInFocus(true)}
        onBlur={() => setIsTextAreaInFocus(false)}
      />
    </div>
  );
};

export default Tiptap;
