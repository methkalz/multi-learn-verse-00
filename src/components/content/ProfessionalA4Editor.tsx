import React from 'react';
import FixedPlainTextA4Editor, { FixedPlainTextA4EditorRef } from './FixedPlainTextA4Editor';

// استخدام المحرر الجديد المحسن كمحرر افتراضي
export interface ProfessionalA4EditorRef extends FixedPlainTextA4EditorRef {}

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
  return <FixedPlainTextA4Editor {...props} ref={ref} />;
});

ProfessionalA4Editor.displayName = 'ProfessionalA4Editor';

export default ProfessionalA4Editor;