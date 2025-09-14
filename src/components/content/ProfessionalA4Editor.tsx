import React from 'react';
import MultiPageDocumentEditor, { MultiPageDocumentEditorRef } from './MultiPageDocumentEditor';

// Re-export the new multi-page document editor as the default A4 editor
export interface ProfessionalA4EditorRef extends MultiPageDocumentEditorRef {}

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
  return <MultiPageDocumentEditor {...props} ref={ref} />;
});

ProfessionalA4Editor.displayName = 'ProfessionalA4Editor';

export default ProfessionalA4Editor;