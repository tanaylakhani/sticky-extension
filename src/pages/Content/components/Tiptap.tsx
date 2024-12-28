import React, { forwardRef } from 'react';
import { EditorContent, Editor } from '@tiptap/react';

interface TiptapProps {
  editor: Editor;
  setIsTextAreaInFocus: (value: boolean) => void;
  data: any;
  color: string;
}

const Tiptap = forwardRef<HTMLDivElement, TiptapProps>(
  ({ editor, setIsTextAreaInFocus, data, color }, ref) => {
    return (
      <div className="px-4">
        <EditorContent
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
