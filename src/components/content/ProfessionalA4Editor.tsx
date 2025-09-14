import React from 'react';
import MultiPageTipTapEditor, { MultiPageTipTapEditorRef } from './MultiPageTipTapEditor';

// Re-export the new TipTap multi-page editor as the default A4 editor
export interface ProfessionalA4EditorRef extends MultiPageTipTapEditorRef {}

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
  return <MultiPageTipTapEditor {...props} ref={ref} />;
});

ProfessionalA4Editor.displayName = 'ProfessionalA4Editor';

export default ProfessionalA4Editor;