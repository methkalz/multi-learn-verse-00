import React from 'react';
import MultiPageA4Editor, { MultiPageA4EditorRef } from './MultiPageA4Editor';

// Re-export the new multi-page editor as the default A4 editor
export interface ProfessionalA4EditorRef extends MultiPageA4EditorRef {}

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
  return <MultiPageA4Editor {...props} ref={ref} />;
});

ProfessionalA4Editor.displayName = 'ProfessionalA4Editor';

export default ProfessionalA4Editor;