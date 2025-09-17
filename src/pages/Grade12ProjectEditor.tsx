import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useGrade12Projects } from '@/hooks/useGrade12Projects';
import { useGrade12DefaultTasks } from '@/hooks/useGrade12DefaultTasks';
import { ProfessionalDocumentEditor } from '@/components/editor/ProfessionalDocumentEditor';
import ProjectTasksManager from '@/components/content/ProjectTasksManager';
import { ProjectCommentsSection } from '@/components/content/ProjectCommentsSection';
import BackButton from '@/components/shared/BackButton';

import { 
  Save, 
  ArrowLeft, 
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
  Sparkles,
  MessageSquare,
  History,
  Info,
  Plus,
  Send,
  RotateCcw,
  BarChart3,
  CheckSquare,
  MessageCircle,
  Eye,
  EyeOff,
  User
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Types for comments and versions
interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  type: 'teacher' | 'student';
}

interface Version {
  id: string;
  content: string;
  timestamp: string;
  changes: string;
}

const Grade12ProjectEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { projects, updateProject, saveRevision, addComment } = useGrade12Projects();
  const { phases, updateTaskCompletion, getOverallProgress } = useGrade12DefaultTasks();
  
  const [project, setProject] = useState<any>(null);
  const [content, setContent] = useState('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'editor' | 'tasks' | 'comments' | 'info'>('editor');
  const [newCommentsCount, setNewCommentsCount] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Comments and versions states
  const [comments, setComments] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [newComment, setNewComment] = useState('');

  // Load project data
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const foundProject = projects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        setContent(foundProject.project_content || '');
        // حساب عدد الكلمات الأولي
        if (foundProject.project_content) {
          try {
            const parsed = JSON.parse(foundProject.project_content);
            const text = extractTextFromTiptapContent(parsed);
            setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
            setCharacterCount(text.length);
          } catch {
            setWordCount(0);
            setCharacterCount(0);
          }
        }
      } else {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على المشروع",
          variant: "destructive",
        });
        navigate(-1);
      }
    }
  }, [projectId, projects, navigate]);

  // دالة لاستخراج النص من محتوى TipTap
  const extractTextFromTiptapContent = (content: any): string => {
    if (!content || !content.content) return '';
    
    let text = '';
    const traverse = (node: any) => {
      if (node.type === 'text') {
        text += node.text;
      }
      if (node.content) {
        node.content.forEach(traverse);
      }
    };
    
    content.content.forEach(traverse);
    return text;
  };

  // معالجة تغيير المحتوى من المحرر
  const handleContentChange = (newContent: any, html: string, plainText: string) => {
    setContent(JSON.stringify(newContent));
    setWordCount(plainText.split(/\s+/).filter(word => word.length > 0).length);
    setCharacterCount(plainText.length);
  };

  // حفظ المحرر
  const handleEditorSave = async (newContent: any) => {
    if (!project?.id) return;
    
    setIsSaving(true);
    try {
      await updateProject(project.id, { 
        project_content: JSON.stringify(newContent)
      });
      setLastSaved(new Date());
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المشروع بنجاح",
      });
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ المشروع",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // حفظ يدوي
  const handleSave = async () => {
    if (!project?.id) return;
    
    setIsSaving(true);
    try {
      await updateProject(project.id, { 
        project_content: content
      });
      setLastSaved(new Date());
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المشروع بنجاح",
      });
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ المشروع",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المشروع...</p>
        </div>
      </div>
    );
  }

  const isStudent = userProfile?.role === 'student';
  const isTeacher = userProfile?.role === 'teacher' || userProfile?.role === 'superadmin';
  const canEdit = isStudent || isTeacher;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                محرر المشاريع
              </h1>
              <p className="text-muted-foreground">
                {project?.title || 'جاري التحميل...'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {project && (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                  <User className="h-4 w-4" />
                  <span>{user?.user_metadata?.full_name || 'الطالب'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                  <Calendar className="h-4 w-4" />
                  <span>الموعد النهائي: {project.due_date ? format(new Date(project.due_date), 'dd/MM/yyyy', { locale: ar }) : 'غير محدد'}</span>
                </div>
              </>
            )}

            <Button
              variant={isPreviewMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="gap-2"
            >
              {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isPreviewMode ? 'إخفاء المعاينة' : 'معاينة'}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!project || isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b">
          <Button
            variant={activeTab === 'editor' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('editor')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            محرر النص
          </Button>
          <Button
            variant={activeTab === 'tasks' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('tasks')}
            className="gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            المهام والمتطلبات
          </Button>
          <Button
            variant={activeTab === 'comments' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('comments')}
            className="gap-2 relative"
          >
            <MessageCircle className="h-4 w-4" />
            التعليقات والملاحظات
            {newCommentsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {newCommentsCount}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === 'info' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('info')}
            className="gap-2"
          >
            <Info className="h-4 w-4" />
            معلومات المشروع
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Editor/Content Section */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <Card className="h-full">
              <CardContent className="p-0">
                <div className="h-[calc(100vh-300px)] min-h-[700px]">
                  {activeTab === 'editor' && (
                    <ProfessionalDocumentEditor
                      documentId={projectId}
                      initialContent={project?.project_content ? JSON.parse(project.project_content) : undefined}
                      onContentChange={handleContentChange}
                      onSave={handleEditorSave}
                      className="h-full"
                      showToolbar={true}
                      showPageBreaks={false}
                      enableCollaboration={false}
                      autoSave={true}
                      title={project?.title || "مشروع التخرج"}
                      wordCount={wordCount}
                      enableImagePasting={true}
                      enableImageResizing={true}
                    />
                  )}
                  
                  {activeTab === 'tasks' && (
                    <div className="p-6 h-full">
                      <ProjectTasksManager 
                        projectId={projectId!}
                        isTeacher={isTeacher}
                        isStudent={isStudent}
                      />
                    </div>
                  )}
                  
                  {activeTab === 'comments' && (
                    <div className="p-6 h-full overflow-y-auto">
                      <ProjectCommentsSection 
                        projectId={projectId!}
                      />
                    </div>
                  )}
                  
                  {activeTab === 'info' && (
                    <div className="p-6 h-full overflow-y-auto">
                      <div className="space-y-6">
                        <div>
                          <Label className="text-base font-semibold">العنوان</Label>
                          <p className="text-muted-foreground mt-2">{project.title}</p>
                        </div>
                        <div>
                          <Label className="text-base font-semibold">الوصف</Label>
                          <p className="text-muted-foreground mt-2">{project.description || 'لا يوجد وصف'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">عدد الكلمات</Label>
                            <p className="text-2xl font-bold text-primary">{wordCount}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">عدد الأحرف</Label>
                            <p className="text-2xl font-bold text-primary">{characterCount}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-base font-semibold">تاريخ الإنشاء</Label>
                          <p className="text-muted-foreground mt-2">
                            {project.created_at ? format(new Date(project.created_at), 'dd/MM/yyyy HH:mm', { locale: ar }) : 'غير متاح'}
                          </p>
                        </div>
                        {project.due_date && (
                          <div>
                            <Label className="text-base font-semibold">تاريخ التسليم</Label>
                            <p className="text-muted-foreground mt-2">
                              {format(new Date(project.due_date), 'dd/MM/yyyy', { locale: ar })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="order-1 xl:order-2 space-y-6">
            {/* Project Info */}
            {project && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات المشروع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">عنوان المشروع</label>
                    <p className="text-sm">{project.title}</p>
                  </div>
                  
                  {project.description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">الوصف</label>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">الحالة</label>
                    <Badge variant={
                      project.status === 'completed' ? 'default' :
                      project.status === 'submitted' ? 'secondary' :
                      project.status === 'in_progress' ? 'outline' : 'destructive'
                    }>
                      {project.status === 'completed' ? 'مكتمل' :
                       project.status === 'submitted' ? 'مُرسل' :
                       project.status === 'in_progress' ? 'قيد التنفيذ' : 'مسودة'}
                    </Badge>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">عدد الكلمات:</span>
                    <span className="font-medium">{wordCount}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">عدد الأحرف:</span>
                    <span className="font-medium">{characterCount}</span>
                  </div>

                  {project.created_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                      <span className="font-medium">
                        {format(new Date(project.created_at), 'dd/MM/yyyy', { locale: ar })}
                      </span>
                    </div>
                  )}

                  {project.updated_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">آخر تحديث:</span>
                      <span className="font-medium">
                        {format(new Date(project.updated_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">الإجراءات السريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab('tasks')}
                >
                  <CheckSquare className="h-4 w-4" />
                  عرض المهام
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 relative"
                  onClick={() => setActiveTab('comments')}
                >
                  <MessageCircle className="h-4 w-4" />
                  التعليقات والملاحظات
                  {newCommentsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {newCommentsCount}
                    </span>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                >
                  <Eye className="h-4 w-4" />
                  {isPreviewMode ? 'إخفاء المعاينة' : 'معاينة المشروع'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grade12ProjectEditor;