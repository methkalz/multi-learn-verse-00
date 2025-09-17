import React, { useState, useEffect, useCallback } from 'react';
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
import Grade12DefaultTasks from '@/components/content/Grade12DefaultTasks';
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
  CheckSquare,
  MessageCircle
} from 'lucide-react';

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const Grade12ProjectEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { 
    projects, 
    fetchProjects, 
    updateProject,
    saveRevision
  } = useGrade12Projects();
  
  const [project, setProject] = useState<any>(null);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [newCommentsCount, setNewCommentsCount] = useState(0);

  const isTeacher = userProfile?.role === 'teacher' || userProfile?.role === 'school_admin' || userProfile?.role === 'superadmin';
  const isStudent = userProfile?.role === 'student';

  // جلب تفاصيل المشروع
  useEffect(() => {
    const loadProject = async () => {
      if (projectId) {
        const foundProject = projects.find(p => p.id === projectId);
        if (foundProject) {
          setProject(foundProject);
        } else {
          // محاولة جلب من الخادم
          await fetchProjects();
        }
      }
    };

    loadProject();
  }, [projectId, projects, fetchProjects]);

  // معالج تغيير المحتوى
  const handleContentChange = useCallback((content: any, html: string, plainText: string) => {
    const words = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characters = plainText.length;
    setWordCount(words);
    setCharacterCount(characters);
  }, []);

  // معالج حفظ المحرر
  const handleEditorSave = useCallback(async (content: any) => {
    if (!projectId) return;

    try {
      await saveRevision(projectId, content);
      setLastSaved(new Date().toLocaleString('ar'));
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المحتوى بنجاح",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ المحتوى",
        variant: "destructive",
      });
    }
  }, [projectId, saveRevision]);

  // معالج حفظ المحتوى العادي
  const handleSaveContent = useCallback(async (content: string) => {
    if (!projectId) return;

    try {
      await updateProject(projectId, { content });
      setLastSaved(new Date().toLocaleString('ar'));
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المحتوى بنجاح",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ المحتوى",
        variant: "destructive",
      });
    }
  }, [projectId, updateProject]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل المشروع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* العنوان والمعلومات العلوية */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {project?.title || 'مشروع التخرج'}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>آخر حفظ: {lastSaved || 'لم يتم الحفظ بعد'}</span>
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              رفع ملف
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              حفظ
            </Button>
          </div>
        </div>

        {/* التخطيط الجديد - المحرر 70% والتابس 30% */}
        <div className="grid grid-cols-10 gap-4 h-[calc(100vh-200px)]">
          {/* المحرر - 70% من الشاشة */}
          <div className="col-span-7">
            <Card className="h-full border-0 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-100 pb-3 px-6 py-4">
                <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  محرر المشروع
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-65px)]">
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
              </CardContent>
            </Card>
          </div>

          {/* التابس - 30% من الشاشة */}
          <div className="col-span-3">
            <Card className="h-full border-0 shadow-sm bg-white">
              <Tabs defaultValue="tasks" className="h-full flex flex-col">
                {/* قائمة التابس المدمجة */}
                <div className="border-b border-slate-100 px-4 py-2">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-50/50 p-0.5 rounded-md h-8">
                    <TabsTrigger 
                      value="tasks" 
                      className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm px-2"
                    >
                      <CheckSquare className="h-3 w-3 mr-1" />
                      المهام
                    </TabsTrigger>
                    <TabsTrigger 
                      value="comments" 
                      className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm px-2 relative"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      التعليقات
                      {newCommentsCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] rounded-full h-3 w-3 flex items-center justify-center">
                          {newCommentsCount}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="info" 
                      className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm px-2"
                    >
                      <Info className="h-3 w-3 mr-1" />
                      معلومات
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* محتوى التابس */}
                <div className="flex-1 overflow-hidden">
                  {/* تاب المهام */}
                  <TabsContent value="tasks" className="h-full p-0 m-0">
                    <div className="h-full overflow-y-auto p-3 space-y-4">
                      {/* المهام الأساسية */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                          <CheckSquare className="h-3.5 w-3.5 text-green-600" />
                          <h3 className="text-sm font-medium text-slate-800">المهام الأساسية</h3>
                        </div>
                        <Grade12DefaultTasks />
                      </div>

                      {/* المهام الإضافية */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                          <Users className="h-3.5 w-3.5 text-purple-600" />
                          <h3 className="text-sm font-medium text-slate-800">مهام المعلم</h3>
                        </div>
                        <ProjectTasksManager 
                          projectId={projectId!}
                          isTeacher={isTeacher}
                          isStudent={isStudent}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* تاب التعليقات */}
                  <TabsContent value="comments" className="h-full p-0 m-0">
                    <div className="h-full overflow-y-auto p-3">
                      <ProjectCommentsSection projectId={projectId!} />
                    </div>
                  </TabsContent>

                  {/* تاب المعلومات */}
                  <TabsContent value="info" className="h-full p-0 m-0">
                    <div className="h-full overflow-y-auto p-3 space-y-3">
                      <div className="space-y-3">
                        <div className="text-center py-4">
                          <Info className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          <h3 className="text-sm font-medium text-slate-800 mb-1">معلومات المشروع</h3>
                          <p className="text-xs text-slate-600">تفاصيل وإحصائيات</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="p-3 bg-slate-50/80 rounded-lg">
                            <div className="text-xs text-slate-600 mb-1">العنوان</div>
                            <div className="text-sm font-medium text-slate-800 truncate">{project?.title || 'غير محدد'}</div>
                          </div>
                          
                          <div className="p-3 bg-slate-50/80 rounded-lg">
                            <div className="text-xs text-slate-600 mb-1.5">الحالة</div>
                            <Badge 
                              variant={
                                project?.status === 'completed' ? 'default' :
                                project?.status === 'submitted' ? 'secondary' :
                                project?.status === 'in_progress' ? 'outline' : 'destructive'
                              }
                              className="text-xs h-5"
                            >
                              {project?.status === 'completed' ? 'مكتمل' :
                               project?.status === 'submitted' ? 'مُرسل' :
                               project?.status === 'in_progress' ? 'قيد التنفيذ' : 'مسودة'}
                            </Badge>
                          </div>
                          
                          <div className="p-3 bg-slate-50/80 rounded-lg">
                            <div className="text-xs text-slate-600 mb-1">الإحصائيات</div>
                            <div className="text-xs text-slate-800">
                              {wordCount} كلمة • {characterCount} حرف
                            </div>
                          </div>
                          
                          {lastSaved && (
                            <div className="p-3 bg-slate-50/80 rounded-lg">
                              <div className="text-xs text-slate-600 mb-1">آخر حفظ</div>
                              <div className="text-xs text-slate-800 truncate">{lastSaved}</div>
                            </div>
                          )}
                          
                          {project?.due_date && (
                            <div className="p-3 bg-slate-50/80 rounded-lg">
                              <div className="text-xs text-slate-600 mb-1">الموعد النهائي</div>
                              <div className="text-xs text-slate-800">
                                {format(new Date(project.due_date), 'dd/MM/yyyy', { locale: ar })}
                              </div>
                            </div>
                          )}
                          
                          {project?.progress_percentage !== undefined && (
                            <div className="p-3 bg-slate-50/80 rounded-lg">
                              <div className="text-xs text-slate-600 mb-1.5">نسبة الإكمال</div>
                              <Progress value={project.progress_percentage} className="h-1.5 mb-1.5" />
                              <div className="text-xs text-slate-800">{project.progress_percentage}% مكتمل</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grade12ProjectEditor;