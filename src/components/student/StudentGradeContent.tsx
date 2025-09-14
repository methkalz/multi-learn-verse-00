import React, { useState } from 'react';
import { useStudentContent } from '@/hooks/useStudentContent';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const currentContent = gradeContent;

  const handleContentClick = async (contentId: string, contentType: any, title: string) => {
    try {
      // Award points based on content type
      const pointsMap = {
        video: 10,
        document: 5,
        lesson: 15,
        project: 25
      };

      const points = pointsMap[contentType] || 5;
      
      await updateProgress(contentId, contentType, 100, 5, points);
      
      toast.success(`تم إكمال ${title} بنجاح! +${points} نقطة`, {
        description: 'تم تسجيل تقدمك في النظام'
      });
    } catch (error) {
      toast.error('حدث خطأ في تسجيل التقدم');
    }
  };

  const ContentCard: React.FC<{ 
    item: any; 
    type: 'video' | 'document' | 'lesson' | 'project';
    icon: any;
    color: string;
    bgColor: string;
  }> = ({ item, type, icon: IconComponent, color, bgColor }) => {
    const progress = item.progress?.progress_percentage || 0;
    const isCompleted = progress >= 100;

    return (
      <Card className={`group hover:shadow-lg transition-all duration-300 ${bgColor} border-0 overflow-hidden relative`}>
        {/* Progress indicator */}
        {progress > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {isCompleted && (
                  <div className="flex items-center gap-1 text-green-600 flex-shrink-0 ml-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">مكتمل</span>
                  </div>
                )}
              </div>

              {item.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Content-specific info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                {item.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.duration}</span>
                  </div>
                )}
                {item.category && (
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                )}
                {item.progress?.points_earned && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="w-3 h-3" />
                    <span>{item.progress.points_earned} نقطة</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {progress > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>التقدم</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleContentClick(item.id, type, item.title)}
                >
                  {type === 'video' && <Play className="w-4 h-4 mr-2" />}
                  {type === 'document' && <Download className="w-4 h-4 mr-2" />}
                  {type === 'lesson' && <BookOpen className="w-4 h-4 mr-2" />}
                  {type === 'project' && <FolderOpen className="w-4 h-4 mr-2" />}
                  
                  {isCompleted ? 'مراجعة' : 
                   type === 'video' ? 'مشاهدة' :
                   type === 'document' ? 'تحميل' :
                   type === 'lesson' ? 'دراسة' : 'فتح'}
                </Button>
                
                {(item.video_url || item.file_path) && (
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
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
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50'
    },
    {
      id: 'documents',
      label: 'المستندات',
      icon: FileText,
      count: currentContent.documents.length,
      items: currentContent.documents,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50'
    },
    {
      id: 'lessons',
      label: 'الدروس',
      icon: BookOpen,
      count: currentContent.lessons.length,
      items: currentContent.lessons,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50'
    },
    {
      id: 'projects',
      label: 'المشاريع',
      icon: Trophy,
      count: currentContent.projects.length,
      items: currentContent.projects,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Grade Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg">
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">محتوى الصف {assignedGrade}</span>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeContentTab} onValueChange={setActiveContentTab}>
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            {contentTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {tab.count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {contentTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.items.length === 0 ? (
              <Card className="text-center p-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <tab.icon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">لا يوجد {tab.label} متاح</h3>
                  <p className="text-muted-foreground">
                    لم يتم إضافة أي {tab.label} للصف {assignedGrade} بعد
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tab.items.map((item: any) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    type={tab.id.slice(0, -1) as any}
                    icon={tab.icon}
                    color={tab.color}
                    bgColor={tab.bgColor}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};