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
import SimpleA4DocumentEditor from '@/components/content/SimpleA4DocumentEditor';
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
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { userProfile } = useAuth();
  const { projects, updateProject, saveRevision, addComment } = useGrade12Projects();
  const { phases, updateTaskCompletion, getOverallProgress } = useGrade12DefaultTasks();
  
  const [project, setProject] = useState<any>(null);
  const [content, setContent] = useState('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wordCount, setWordCount] = useState(0);

  // Comments and versions states
  const [comments, setComments] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('editor');


  // Load project data
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const foundProject = projects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        setContent(foundProject.project_content || '');
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

  // Auto-save functionality with versioning
  useEffect(() => {
    if (!project?.id || content === project?.project_content) return;

    const autoSaveTimer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await updateProject(project.id, { project_content: content });
        
        // Save auto version history (max 5 versions)
        const newVersion: Version = {
          id: `auto_${Date.now()}`,
          content,
          timestamp: new Date().toISOString(),
          changes: `تحديث تلقائي - ${new Date().toLocaleTimeString('en-US')}`
        };
        setVersions(prev => {
          const filtered = prev.filter(v => !v.id.startsWith('auto_'));
          return [newVersion, ...filtered].slice(0, 5);
        });
        
        setLastSaved(new Date());
        toast({
          title: "تم الحفظ التلقائي",
          description: "تم حفظ التغييرات تلقائياً",
        });
      } catch (error) {
        console.error('Error auto-saving:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [content, project?.id, project?.project_content, updateProject]);

  // Load comments when project changes
  useEffect(() => {
    if (project?.id) {
      loadComments();
      loadVersionHistory();
    }
  }, [project?.id]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('grade10_project_comments')
        .select(`
          *,
          profiles (
            full_name,
            role
          )
        `)
        .eq('project_id', project?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedComments = data?.map(comment => ({
        id: comment.id,
        text: comment.comment_text,
        author: (comment.profiles as any)?.full_name || 'مستخدم مجهول',
        timestamp: comment.created_at,
        type: (comment.profiles as any)?.role === 'teacher' ? 'teacher' : 'student' as 'teacher' | 'student'
      })) || [];

      setComments(formattedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadVersionHistory = () => {
    // In real app, this would load from database
    // For now, just initialize empty
    setVersions([]);
  };

  const handleManualSave = async () => {
    if (!project?.id) return;

    try {
      setIsAutoSaving(true);
      await updateProject(project.id, { project_content: content });
      
      // Save manual version history (max 3 versions)
      const newVersion: Version = {
        id: `manual_${Date.now()}`,
        content,
        timestamp: new Date().toISOString(),
        changes: `حفظ يدوي - ${new Date().toLocaleTimeString('en-US')}`
      };
      setVersions(prev => {
        const filtered = prev.filter(v => !v.id.startsWith('manual_'));
        return [newVersion, ...filtered].slice(0, 3);
      });
      
      setLastSaved(new Date());
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المشروع بنجاح",
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ المشروع",
        variant: "destructive",
      });
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !project?.id || !userProfile?.user_id) return;

    try {
      const { error } = await supabase
        .from('grade10_project_comments')
        .insert({
          project_id: project.id,
          user_id: userProfile.user_id,
          comment_text: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      loadComments(); // Refresh comments
      toast({
        title: "تم إضافة التعليق",
        description: "تم إضافة تعليقك بنجاح",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة التعليق",
        variant: "destructive",
      });
    }
  };

  const restoreVersion = (version: Version) => {
    setContent(version.content);
    toast({
      title: "تم استرجاع النسخة",
      description: `تم استرجاع المحتوى من ${new Date(version.timestamp).toLocaleString('ar')}`,
    });
  };

  const calculateProgress = (content: string): number => {
    if (!content) return 0;
    
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const hasImages = content.includes('<img') || content.includes('[صورة]');
    const hasTables = content.includes('<table') || content.includes('|');
    
    let score = 0;
    if (wordCount > 100) score += 40;
    else if (wordCount > 50) score += 20;
    else if (wordCount > 20) score += 10;
    
    if (hasImages) score += 30;
    if (hasTables) score += 30;
    
    return Math.min(score, 100);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      default: return 'لم يبدأ';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                العودة
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusText(project.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    تقدم: {calculateProgress(content)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-sm text-muted-foreground">
                  آخر حفظ: {lastSaved.toLocaleTimeString('ar')}
                </span>
              )}
              {isAutoSaving && (
                <span className="text-sm text-primary">جاري الحفظ...</span>
              )}
              <Button onClick={handleManualSave} disabled={isAutoSaving}>
                <Save className="h-4 w-4 mr-2" />
                حفظ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5" dir="rtl">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              المحرر
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              التعليقات ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              السجل
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              المعلومات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4 h-full">
            <div className="flex flex-col h-full">
              <SimpleA4DocumentEditor
                initialContent={content}
                onContentChange={(newContent, wordCount, pageCount) => {
                  setContent(newContent);
                  setWordCount(wordCount);
                }}
                onSave={handleManualSave}
                readOnly={!canEdit}
                autoSave={true}
                className="flex-1"
              />
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>التعليقات والملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add comment form */}
                  {canEdit && (
                    <div className="flex gap-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="أضف تعليقاً..."
                        className="flex-1"
                        rows={3}
                      />
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Comments list */}
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{comment.author}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={comment.type === 'teacher' ? 'default' : 'secondary'}>
                                {comment.type === 'teacher' ? 'معلم' : 'طالب'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleString('ar')}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          لا توجد تعليقات بعد
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>سجل النسخ</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {versions.map((version) => (
                      <div key={version.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{version.changes}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(version.timestamp).toLocaleString('ar')}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => restoreVersion(version)}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              استرجاع
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {version.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                    {versions.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        لا توجد نسخ محفوظة بعد
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">عدد الكلمات</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{wordCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">عدد الأحرف</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{content.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">عدد الصفحات</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.ceil(wordCount / 250) || 1}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">التعليقات</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{comments.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">التقدم</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateProgress(content)}%</div>
                  <Progress value={calculateProgress(content)} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات المشروع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>العنوان</Label>
                    <p className="text-sm text-muted-foreground mt-1">{project.title}</p>
                  </div>
                  <div>
                    <Label>الوصف</Label>
                    <p className="text-sm text-muted-foreground mt-1">{project.description || 'لا يوجد وصف'}</p>
                  </div>
                  <div>
                    <Label>تاريخ الإنشاء</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(project.created_at).toLocaleDateString('ar')}
                    </p>
                  </div>
                  {project.due_date && (
                    <div>
                      <Label>تاريخ التسليم</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(project.due_date).toLocaleDateString('ar')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Editor Specific Styles */}
      <style>{`
        .project-editor-container {
          /* Isolate editor styles from global CSS */
          isolation: isolate;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f0f0f0;
          min-height: calc(100vh - 120px);
          padding: 2rem 1rem;
        }
        
        .a4-page {
          width: 21cm;
          min-height: 29.7cm;
          max-height: 29.7cm;
          background: white;
          margin: 0 auto 2cm auto;
          padding: 2.5cm;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          border: 1px solid #ddd;
          overflow: hidden;
          position: relative;
          page-break-after: always;
        }
        
        .project-editor-container .document-editor {
          font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-align: right;
          line-height: 1.6;
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        
        .project-editor-container .document-editor:focus {
          outline: none;
        }
        
        .project-editor-container .document-editor p {
          margin: 0 0 1em 0;
          direction: auto;
        }
        
        .project-editor-container .document-editor h1,
        .project-editor-container .document-editor h2,
        .project-editor-container .document-editor h3 {
          margin: 1.5em 0 0.5em 0;
          direction: auto;
        }
        
        .project-editor-container .document-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        
        .project-editor-container .document-editor table td,
        .project-editor-container .document-editor table th {
          padding: 12px;
          border: 1px solid #ddd;
          text-align: inherit;
          direction: auto;
        }
        
        .project-editor-container .document-editor table th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        
        .project-editor-container .document-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 10px 0;
          display: block;
        }
        
        .project-editor-container .document-editor ul,
        .project-editor-container .document-editor ol {
          margin: 1em 0;
          padding-right: 2em;
          direction: auto;
        }
        
        .project-editor-container .document-editor li {
          margin: 0.5em 0;
          direction: auto;
        }
        
        .page-indicator {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          z-index: 1000;
        }
        
        /* Print styles */
        @media print {
          .project-editor-container {
            background: white;
            padding: 0;
          }
          
          .a4-page {
            margin: 0;
            box-shadow: none;
            border: none;
            page-break-after: always;
          }
          
          .page-indicator {
            display: none;
          }
        }
        
        /* Auto page break functionality */
        .auto-page-break {
          page-break-before: always;
        }
      `}</style>
    </div>
  );
};

export default Grade12ProjectEditor;