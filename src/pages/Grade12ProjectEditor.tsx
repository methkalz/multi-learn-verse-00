import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useGrade12Projects } from '@/hooks/useGrade12Projects';
import { useGrade12DefaultTasks } from '@/hooks/useGrade12DefaultTasks';
import { ProfessionalDocumentEditor } from '@/components/editor/ProfessionalDocumentEditor';
import ProjectTasksManager from '@/components/content/ProjectTasksManager';
import { ProjectCommentsSection } from '@/components/content/ProjectCommentsSection';
import BackButton from '@/components/shared/BackButton';

import { 
  Save, 
  Clock, 
  FileText, 
  Users,
  CheckCircle,
  Calendar,
  Upload,
  Download,
  Trophy,
  MessageSquare,
  History,
  Info,
  BarChart3,
  CheckSquare,
  MessageCircle,
  Eye,
  EyeOff,
  User
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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
  const [newCommentsCount, setNewCommentsCount] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      <div className="container mx-auto p-4 max-w-full">
        {/* Header مع معلومات المشروع الأساسية */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {project?.title || 'جاري التحميل...'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user?.user_metadata?.full_name || 'الطالب'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>الموعد النهائي: {project.due_date ? format(new Date(project.due_date), 'dd/MM/yyyy', { locale: ar }) : 'غير محدد'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{wordCount} كلمة • {characterCount} حرف</span>
                </div>
                <Badge variant={
                  project?.status === 'completed' ? 'default' :
                  project?.status === 'submitted' ? 'secondary' :
                  project?.status === 'in_progress' ? 'outline' : 'destructive'
                }>
                  {project?.status === 'completed' ? 'مكتمل' :
                   project?.status === 'submitted' ? 'مُرسل' :
                   project?.status === 'in_progress' ? 'قيد التنفيذ' : 'مسودة'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

        {/* نظام التابات الرئيسي */}
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="editor" className="gap-2">
              <FileText className="h-4 w-4" />
              محرر النص
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              المهام والمتطلبات
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2 relative">
              <MessageCircle className="h-4 w-4" />
              التعليقات والملاحظات
              {newCommentsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {newCommentsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="info" className="gap-2">
              <Info className="h-4 w-4" />
              معلومات المشروع
            </TabsTrigger>
          </TabsList>

          {/* محرر النص - كامل العرض */}
          <TabsContent value="editor" className="w-full">
            <Card className="w-full">
              <CardContent className="p-0">
                <div className="h-[calc(100vh-250px)] min-h-[800px]">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* المهام والمتطلبات */}
          <TabsContent value="tasks" className="w-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="h-[calc(100vh-250px)] min-h-[800px]">
                  <ProjectTasksManager 
                    projectId={projectId!}
                    isTeacher={isTeacher}
                    isStudent={isStudent}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* التعليقات والملاحظات */}
          <TabsContent value="comments" className="w-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="h-[calc(100vh-250px)] min-h-[800px] overflow-y-auto">
                  <ProjectCommentsSection 
                    projectId={projectId!}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* معلومات المشروع */}
          <TabsContent value="info" className="w-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="h-[calc(100vh-250px)] min-h-[800px] overflow-y-auto">
                  <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* معلومات المشروع الأساسية */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            معلومات المشروع
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-semibold">العنوان</Label>
                              <p className="text-muted-foreground mt-2 text-lg">{project.title}</p>
                            </div>
                            <div>
                              <Label className="text-base font-semibold">الوصف</Label>
                              <p className="text-muted-foreground mt-2">{project.description || 'لا يوجد وصف'}</p>
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
                      </div>

                      {/* إحصائيات المشروع */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            إحصائيات المشروع
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-primary">{wordCount}</div>
                                <Label className="text-sm text-muted-foreground">عدد الكلمات</Label>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-primary">{characterCount}</div>
                                <Label className="text-sm text-muted-foreground">عدد الأحرف</Label>
                              </CardContent>
                            </Card>
                          </div>
                          
                          {lastSaved && (
                            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-muted-foreground">آخر حفظ:</span>
                                <span className="font-medium text-green-600">
                                  {format(lastSaved, 'HH:mm:ss', { locale: ar })}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* حالة المشروع */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Trophy className="h-5 w-5 text-yellow-500" />
                              حالة المشروع
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">نسبة الإنجاز</span>
                                <span className="text-sm font-medium">85%</span>
                              </div>
                              <Progress value={85} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div className="p-3 bg-primary/10 rounded-lg">
                                <div className="text-2xl font-bold text-primary">12</div>
                                <div className="text-xs text-muted-foreground">مهام مكتملة</div>
                              </div>
                              <div className="p-3 bg-warning/10 rounded-lg">
                                <div className="text-2xl font-bold text-warning">3</div>
                                <div className="text-xs text-muted-foreground">مهام متبقية</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* إجراءات سريعة */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                              <Download className="h-4 w-4" />
                              تصدير كـ PDF
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                              <Upload className="h-4 w-4" />
                              رفع ملف مرفق
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                              <History className="h-4 w-4" />
                              سجل التغييرات
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Grade12ProjectEditor;