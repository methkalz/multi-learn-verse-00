import React from 'react';
import SimpleA4PageEditor, { SimpleA4PageEditorRef } from './SimpleA4PageEditor';

// Re-export the new simple A4 page editor as the default A4 editor
export interface ProfessionalA4EditorRef extends SimpleA4PageEditorRef {}

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
  return <SimpleA4PageEditor {...props} ref={ref} />;
});

ProfessionalA4Editor.displayName = 'ProfessionalA4Editor';

export default ProfessionalA4Editor;