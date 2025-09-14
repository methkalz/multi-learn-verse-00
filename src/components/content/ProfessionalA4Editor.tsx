import React from 'react';
import PlainTextA4Editor, { PlainTextA4EditorRef } from './PlainTextA4Editor';

// Re-export the new plain text A4 editor as the default A4 editor
export interface ProfessionalA4EditorRef extends PlainTextA4EditorRef {}

interface ProfessionalA4EditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  readOnly?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  className?: string;
}

const ProfessionalA4Editor = React.forwardRef<ProfessionalA4EditorRef, ProfessionalA4EditorProps>((props, ref) => {
  return <PlainTextA4Editor {...props} ref={ref} />;
});

ProfessionalA4Editor.displayName = 'ProfessionalA4Editor';

export default ProfessionalA4Editor;