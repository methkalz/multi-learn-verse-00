import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useGrade12Projects } from '@/hooks/useGrade12Projects';
import { useGrade12DefaultTasks } from '@/hooks/useGrade12DefaultTasks';
import EnhancedDocumentEditor from './EnhancedDocumentEditor';
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
  Download,
  Trophy,
  Target,
  Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Grade12FinalProjectEditorProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const Grade12FinalProjectEditor: React.FC<Grade12FinalProjectEditorProps> = ({
  project,
  isOpen,
  onClose,
  onSave
}) => {
  const { userProfile } = useAuth();
  const { updateProject } = useGrade12Projects();
  const { phases, updateTaskCompletion, getOverallProgress } = useGrade12DefaultTasks();
  const [content, setContent] = useState(project?.project_content || '');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!project?.id || content === project?.project_content) return;

    const autoSaveTimer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await updateProject(project.id, { project_content: content });
        setLastSaved(new Date());
        toast({
          title: "حُفظ تلقائياً",
          description: "تم حفظ المشروع النهائي تلقائياً",
          duration: 2000
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, project?.id, project?.project_content, updateProject]);

  const handleSave = async () => {
    if (!project?.id) return;

    try {
      await updateProject(project.id, { project_content: content });
      setLastSaved(new Date());
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المشروع النهائي بنجاح"
      });
      onSave?.();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ المشروع النهائي",
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
      // Upload to Supabase Storage - using same bucket as Grade 10
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('grade10-documents')
        .upload(`grade12-final-projects/${project.id}/${fileName}`, file);

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('grade10-documents')
        .getPublicUrl(data.path);

      // Insert image into editor
      const imageHTML = `<img src="${publicUrlData.publicUrl}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" alt="صورة المشروع النهائي" />`;
      
      setContent(prev => prev + imageHTML);

      toast({
        title: "تم رفع الصورة",
        description: "تم إدراج الصورة في المشروع النهائي بنجاح"
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

  const handleTaskToggle = async (taskId: string, isCompleted: boolean) => {
    try {
      await updateTaskCompletion(taskId, isCompleted);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const isStudent = userProfile?.role === 'student';
  const canEdit = isStudent && project?.student_id === userProfile?.user_id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'in_progress': return 'قيد التنفيذ';
      case 'submitted': return 'مُسلم';
      case 'reviewed': return 'تم المراجعة';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const overallProgress = getOverallProgress();

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">المشروع النهائي: {project.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  آخر حفظ: {lastSaved ? lastSaved.toLocaleTimeString('en-US') : 'لم يتم الحفظ'}
                  {isAutoSaving && <span className="text-blue-600 ml-2">جاري الحفظ...</span>}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(project.status)}>
                {getStatusText(project.status)}
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Tasks Sidebar */}
          <div className="w-80 flex-shrink-0 bg-muted/30 rounded-lg p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  المهام الافتراضية
                </h3>
                <div className="space-y-2">
                  <Progress value={overallProgress.percentage} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {overallProgress.completed} من {overallProgress.total} مهام مكتملة
                  </p>
                </div>
              </div>

              {phases.map((phase) => (
                <Card key={phase.phase_number} className="bg-background border border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-orange-500" />
                        {phase.phase_title}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {phase.completion_percentage}%
                      </Badge>
                    </div>
                    <Progress value={phase.completion_percentage} className="h-1.5" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {phase.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <button
                            onClick={() => handleTaskToggle(task.id, !task.progress?.is_completed)}
                            className="mt-0.5 flex-shrink-0"
                            disabled={!canEdit}
                          >
                            <CheckCircle 
                              className={`h-4 w-4 transition-colors ${
                                task.progress?.is_completed 
                                  ? 'text-green-600 fill-green-100' 
                                  : 'text-muted-foreground hover:text-green-600'
                              }`} 
                            />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium leading-tight ${
                              task.progress?.is_completed 
                                ? 'line-through text-muted-foreground' 
                                : 'text-foreground'
                            }`}>
                              {task.task_title}
                            </p>
                            {task.task_description && (
                              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                                {task.task_description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-full">
              <EnhancedDocumentEditor
                content={content}
                onChange={setContent}
                readOnly={!canEdit}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t pt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                آخر تحديث: {new Date(project.updated_at).toLocaleString('en-US')}
              </span>
            </div>
            {project.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  موعد التسليم: {new Date(project.due_date).toLocaleDateString('en-US')}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  رفع صورة
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isAutoSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  حفظ يدوي
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Grade12FinalProjectEditor;