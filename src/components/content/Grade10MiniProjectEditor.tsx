import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useGrade10MiniProjects } from '@/hooks/useGrade10MiniProjects';
import DocumentEditor from './DocumentEditor';
import { 
  Save, 
  X, 
  Clock, 
  FileText, 
  Users,
  CheckCircle,
  Calendar,
  Upload,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Grade10MiniProjectEditorProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const Grade10MiniProjectEditor: React.FC<Grade10MiniProjectEditorProps> = ({
  project,
  isOpen,
  onClose,
  onSave
}) => {
  const { userProfile } = useAuth();
  const { updateProjectContent, updateProjectStatus } = useGrade10MiniProjects();
  const [content, setContent] = useState(project?.content || '');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!project?.id || content === project?.content) return;

    const autoSaveTimer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await updateProjectContent(project.id, content);
        setLastSaved(new Date());
        toast({
          title: "حُفظ تلقائياً",
          description: "تم حفظ المشروع تلقائياً",
          duration: 2000
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, project?.id, project?.content, updateProjectContent]);

  const handleSave = async () => {
    if (!project?.id) return;

    try {
      await updateProjectContent(project.id, content);
      setLastSaved(new Date());
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المشروع بنجاح"
      });
      onSave?.();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ المشروع",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !project?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة صالح",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('grade10-documents')
        .upload(`projects/${project.id}/${fileName}`, file);

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('grade10-documents')
        .getPublicUrl(data.path);

      // Insert image into editor
      const imageHTML = `<img src="${publicUrlData.publicUrl}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" alt="صورة المشروع" />`;
      
      setContent(prev => prev + imageHTML);

      toast({
        title: "تم رفع الصورة",
        description: "تم إدراج الصورة في المشروع بنجاح"
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
        variant: "destructive"
      });
    }
  };

  const handlePasteImage = (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          // Create a fake input event to reuse the upload logic
          const fakeEvent = {
            target: { files: [file] }
          } as any;
          handleImageUpload(fakeEvent);
        }
        break;
      }
    }
  };

  useEffect(() => {
    document.addEventListener('paste', handlePasteImage);
    return () => document.removeEventListener('paste', handlePasteImage);
  }, [project?.id]);

  const isStudent = userProfile?.role === 'student';
  const canEdit = isStudent && project?.student_id === userProfile?.user_id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'reviewed': return 'تم المراجعة';
      default: return status;
    }
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl mb-2">{project.title}</DialogTitle>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(project.status)}>
                  {getStatusText(project.status)}
                </Badge>
                {project.progress_percentage !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>التقدم: {project.progress_percentage}%</span>
                    <Progress value={project.progress_percentage} className="w-20 h-2" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canEdit && (
                <>
                  {/* Image Upload Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    رفع صورة
                  </Button>
                  
                  {/* Save Button */}
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="gap-2"
                    disabled={isAutoSaving}
                  >
                    <Save className="h-4 w-4" />
                    {isAutoSaving ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </>
              )}
              
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="flex-1 overflow-hidden">
          {canEdit ? (
            <div className="h-full">
              <DocumentEditor
                content={content}
                onChange={setContent}
                placeholder="ابدأ بكتابة مشروعك هنا... يمكنك إضافة النصوص والجداول والصور"
              />
            </div>
          ) : (
            <div className="h-full overflow-auto p-6">
              <div 
                className="prose prose-lg max-w-none"
                style={{ direction: 'rtl' }}
                dangerouslySetInnerHTML={{ __html: project.content || '<p class="text-muted-foreground">لا يوجد محتوى في هذا المشروع بعد.</p>' }}
              />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {project.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>موعد التسليم: {new Date(project.due_date).toLocaleDateString('ar-EG')}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>تم الإنشاء: {new Date(project.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
            
            {lastSaved && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>آخر حفظ: {lastSaved.toLocaleTimeString('ar-EG')}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Grade10MiniProjectEditor;