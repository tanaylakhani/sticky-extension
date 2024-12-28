import React, { forwardRef, useState, useCallback } from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import { extractPublicIdFromUrl } from '../utils/imageUtils';
import { FaTimesCircle } from 'react-icons/fa';
import { deleteImage } from '../services/api';

interface TiptapProps {
  editor: Editor;
  setIsTextAreaInFocus: (value: boolean) => void;
  data: any;
  color: string;
  id: string;
}

const Tiptap = forwardRef<HTMLDivElement, TiptapProps>(
  ({ editor, setIsTextAreaInFocus, data, color, id }, ref) => {
    const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(
      null
    );

    const handleImageSelection = () => {
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
    };

    const removeImage = useCallback(() => {
      if (!editor || !selectedImage) return;

      const imageUrl = selectedImage.getAttribute('src');
      if (imageUrl) {
        const publicId = extractPublicIdFromUrl(imageUrl);
        deleteImage(publicId).catch((error) => {
          console.error('Error deleting image:', error);
        });
      }

      const { state, view } = editor;
      const { from, to } = state.selection;
      view.dispatch(view.state.tr.delete(from, to));
      setSelectedImage(null);
    }, [editor, selectedImage]);

    if (!editor) {
      return null;
    }

    editor.on('update', ({ editor }) => {
      const newValue = editor.getJSON();
      // Update note content here if needed
      console.log('Content updated:', newValue);
    });

    editor.on('selectionUpdate', handleImageSelection);

    return (
      <div className="nodrag h-[70%]" style={{ userSelect: 'text' }}>
        {selectedImage && (
          <button
            onClick={removeImage}
            style={{
              position: 'absolute',
              top: '4px',
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
          onClick={() => editor.commands.focus()}
          onDragStart={(event) => event.preventDefault()}
          className="max-h-full overflow-y-auto w-full resize-none bg-transparent px-4 text-sm focus:outline-none"
          editor={editor}
          onFocus={() => setIsTextAreaInFocus(true)}
          onBlur={() => setIsTextAreaInFocus(false)}
          style={{
            color: 'inherit',
            minHeight: '100px',
          }}
        />
      </div>
    );
  }
);

Tiptap.displayName = 'Tiptap';

export default Tiptap;
