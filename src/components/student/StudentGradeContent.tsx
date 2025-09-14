import React, { useState } from 'react';
import { useStudentContent } from '@/hooks/useStudentContent';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoViewer } from './viewers/VideoViewer';
import { DocumentViewer } from './viewers/DocumentViewer';
import { LessonViewer } from './viewers/LessonViewer';
import { ProjectViewer } from './viewers/ProjectViewer';
import { 
  Play, 
  FileText, 
  FolderOpen, 
  Clock, 
  CheckCircle, 
  Star,
  BookOpen,
  Video,
  Download,
  ExternalLink,
  Trophy,
  Target,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export const StudentGradeContent: React.FC = () => {
  const { 
    gradeContent, 
    assignedGrade, 
    loading,
    error
  } = useStudentContent();
  const { updateProgress } = useStudentProgress();
  const [activeContentTab, setActiveContentTab] = useState('videos');
  
  // Viewer states
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [viewerType, setViewerType] = useState<'video' | 'document' | 'lesson' | 'project' | null>(null);

  const currentContent = gradeContent;

  const handleContentClick = (content: any, contentType: 'video' | 'document' | 'lesson' | 'project') => {
    setSelectedContent(content);
    setViewerType(contentType);
  };

  const handleContentProgress = async (contentId: string, contentType: any, progress: number, timeSpent: number) => {
    try {
      await updateProgress(contentId, contentType, progress, timeSpent, 0);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleContentComplete = async (contentId: string, contentType: any, timeSpent: number) => {
    try {
      const pointsMap = {
        video: 10,
        document: 5,
        lesson: 15,
        project: 25
      };

      const points = pointsMap[contentType] || 5;
      
      await updateProgress(contentId, contentType, 100, timeSpent, points);
      
      toast.success(`تم إكمال ${selectedContent?.title} بنجاح! +${points} نقطة`, {
        description: 'تم تسجيل تقدمك في النظام'
      });
    } catch (error) {
      toast.error('حدث خطأ في تسجيل التقدم');
    }
  };

  const closeViewer = () => {
    setSelectedContent(null);
    setViewerType(null);
  };

  const ContentCard: React.FC<{ 
    item: any; 
    type: 'video' | 'document' | 'lesson' | 'project';
    icon: any;
    color: string;
  }> = ({ item, type, icon: IconComponent, color }) => {
    const progress = item.progress?.progress_percentage || 0;
    const isCompleted = progress >= 100;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border border-border/50 overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header with icon and title */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground line-clamp-2 text-base mb-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {isCompleted && (
                <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Progress bar (only if there's progress) */}
            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">التقدم</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Bottom info and action */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {item.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.duration}</span>
                  </div>
                )}
                {item.progress?.points_earned && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="w-3 h-3" />
                    <span>{item.progress.points_earned}</span>
                  </div>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => handleContentClick(item, type)}
                className="shrink-0"
              >
                {isCompleted ? 'مراجعة' : 'ابدأ'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center p-8">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold">حدث خطأ في تحميل المحتوى</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </div>
      </Card>
    );
  }

  if (!currentContent) {
    return (
      <Card className="text-center p-8">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">لا يوجد محتوى متاح</h3>
          <p className="text-muted-foreground">
            لا يوجد محتوى متاح للصف {assignedGrade} حالياً
          </p>
        </div>
      </Card>
    );
  }

  const contentTabs = [
    {
      id: 'videos',
      label: 'الفيديوهات',
      icon: Video,
      count: currentContent.videos.length,
      items: currentContent.videos,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'documents',
      label: 'المستندات',
      icon: FileText,
      count: currentContent.documents.length,
      items: currentContent.documents,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'lessons',
      label: 'الدروس',
      icon: BookOpen,
      count: currentContent.lessons.length,
      items: currentContent.lessons,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'projects',
      label: assignedGrade === '10' ? 'ميني بروجكت' : 'المشاريع',
      icon: Trophy,
      count: currentContent.projects.length,
      items: currentContent.projects,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <>
      <div className="space-y-8 px-4">
        {/* Simple Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            محتوى الصف {assignedGrade}
          </h1>
          <p className="text-muted-foreground text-base">
            تصفح المواد التعليمية واكتسب النقاط
          </p>
        </div>

      {/* Content Tabs */}
      <Tabs value={activeContentTab} onValueChange={setActiveContentTab} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl h-12 bg-muted/50">
            {contentTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="flex items-center gap-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <Badge variant="secondary" className="text-xs ml-1 bg-primary/10 text-primary">
                    {tab.count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {contentTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-8">
            {tab.items.length === 0 ? (
              <Card className="text-center p-12 bg-muted/20">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <tab.icon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground">لا يوجد {tab.label} متاح</h3>
                  <p className="text-sm text-muted-foreground">
                    لم يتم إضافة أي {tab.label} للصف {assignedGrade} بعد
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tab.items.map((item: any) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    type={tab.id.slice(0, -1) as any}
                    icon={tab.icon}
                    color={tab.color}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      </div>

      {/* Content Viewers */}
      {viewerType === 'video' && selectedContent && (
        <VideoViewer
          isOpen={true}
          onClose={closeViewer}
          video={selectedContent}
          onProgress={(progress, watchTime) => 
            handleContentProgress(selectedContent.id, 'video', progress, watchTime)
          }
          onComplete={() => 
            handleContentComplete(selectedContent.id, 'video', 0)
          }
        />
      )}

      {viewerType === 'document' && selectedContent && (
        <DocumentViewer
          isOpen={true}
          onClose={closeViewer}
          document={selectedContent}
          onProgress={(progress, readTime) => 
            handleContentProgress(selectedContent.id, 'document', progress, readTime)
          }
          onComplete={() => 
            handleContentComplete(selectedContent.id, 'document', 0)
          }
        />
      )}

      {viewerType === 'lesson' && selectedContent && (
        <LessonViewer
          isOpen={true}
          onClose={closeViewer}
          lesson={selectedContent}
          onProgress={(progress, studyTime) => 
            handleContentProgress(selectedContent.id, 'lesson', progress, studyTime)
          }
          onComplete={() => 
            handleContentComplete(selectedContent.id, 'lesson', 0)
          }
        />
      )}

      {viewerType === 'project' && selectedContent && (
        <ProjectViewer
          isOpen={true}
          onClose={closeViewer}
          project={selectedContent}
          onProgress={(progress, workTime) => 
            handleContentProgress(selectedContent.id, 'project', progress, workTime)
          }
          onComplete={() => 
            handleContentComplete(selectedContent.id, 'project', 0)
          }
        />
      )}
    </>
  );
};