import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAvailableGrades } from './useAvailableGrades';
import { logger } from '@/lib/logger';

export interface StudentContentItem {
  id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'document' | 'project' | 'lesson';
  grade_level: string;
  category?: string;
  file_path?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: string;
  is_visible: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  progress?: {
    progress_percentage: number;
    completed_at?: string;
    points_earned: number;
    time_spent_minutes: number;
  };
}

export interface GradeContent {
  grade: string;
  videos: StudentContentItem[];
  documents: StudentContentItem[];
  projects: StudentContentItem[];
  lessons: any[];
}

export const useStudentContent = () => {
  const { user, userProfile } = useAuth();
  const { availableGrades, isGradeAvailable } = useAvailableGrades();
  const [gradeContent, setGradeContent] = useState<GradeContent[]>([]);
  const [currentGrade, setCurrentGrade] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContentForGrade = async (grade: string): Promise<GradeContent> => {
    try {
      // Fetch videos
      const { data: videos, error: videosError } = await supabase
        .from(grade === '10' ? 'grade10_videos' : 
              grade === '11' ? 'grade11_videos' : 'grade12_videos')
        .select('*')
        .eq('is_active', true)
        .eq('is_visible', true)
        .order('order_index', { ascending: true });

      if (videosError) throw videosError;

      // Fetch documents
      const { data: documents, error: documentsError } = await supabase
        .from(grade === '10' ? 'grade10_documents' : 'grade11_documents')
        .select('*')
        .eq('is_active', true)
        .eq('is_visible', true)
        .order('order_index', { ascending: true });

      if (documentsError && documentsError.code !== 'PGRST116') {
        throw documentsError;
      }

      // Fetch projects (for grade 10 and 12)
      let projects: any[] = [];
      if (grade === '10') {
        const { data: projectData, error: projectsError } = await supabase
          .from('grade10_mini_projects')
          .select('*')
          .eq('student_id', user?.id)
          .order('created_at', { ascending: false });

        if (projectsError && projectsError.code !== 'PGRST116') {
          throw projectsError;
        }
        projects = projectData || [];
      }

      // Fetch lessons (for grade 11)
      let lessons: any[] = [];
      if (grade === '11') {
        const { data: lessonData, error: lessonsError } = await supabase
          .from('grade11_lessons')
          .select(`
            *,
            sections:grade11_sections(
              *,
              topics:grade11_topics(*)
            )
          `)
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (lessonsError && lessonsError.code !== 'PGRST116') {
          throw lessonsError;
        }
        lessons = lessonData || [];
      }

      // Get progress data for this grade content
      const allContentIds = [
        ...(videos || []).map(v => v.id),
        ...(documents || []).map(d => d.id),
        ...projects.map(p => p.id),
        ...lessons.map(l => l.id)
      ];

      let progressData: any[] = [];
      if (allContentIds.length > 0 && user) {
        const { data: progress, error: progressError } = await supabase
          .from('student_progress')
          .select('*')
          .eq('student_id', user.id)
          .in('content_id', allContentIds);

        if (progressError) {
          logger.warn('Could not fetch progress data', progressError);
        } else {
          progressData = progress || [];
        }
      }

      // Map progress to content items
      const mapContentWithProgress = (items: any[], contentType: string) => {
        return items.map(item => {
          const progress = progressData.find(p => 
            p.content_id === item.id && p.content_type === contentType
          );
          
          return {
            ...item,
            content_type: contentType,
            grade_level: grade,
            progress: progress ? {
              progress_percentage: progress.progress_percentage,
              completed_at: progress.completed_at,
              points_earned: progress.points_earned,
              time_spent_minutes: progress.time_spent_minutes
            } : undefined
          };
        });
      };

      return {
        grade,
        videos: mapContentWithProgress(videos || [], 'video'),
        documents: mapContentWithProgress(documents || [], 'document'),
        projects: mapContentWithProgress(projects, 'project'),
        lessons: mapContentWithProgress(lessons, 'lesson')
      };

    } catch (err) {
      logger.error(`Error fetching content for grade ${grade}`, err as Error);
      throw err;
    }
  };

  const fetchAllAvailableContent = async () => {
    if (!user || userProfile?.role !== 'student' || availableGrades.length === 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contentPromises = availableGrades.map(grade => fetchContentForGrade(grade));
      const results = await Promise.all(contentPromises);
      
      setGradeContent(results);

      // Set current grade to student's assigned grade or first available
      if (!currentGrade && availableGrades.length > 0) {
        // Try to determine student's grade from profile or use first available
        const studentGrade = availableGrades[0];
        setCurrentGrade(studentGrade);
      }

      logger.info('Student content loaded successfully', { 
        grades: availableGrades,
        contentCount: results.reduce((acc, grade) => 
          acc + grade.videos.length + grade.documents.length + 
          grade.projects.length + grade.lessons.length, 0
        )
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل المحتوى التعليمي';
      setError(errorMessage);
      logger.error('Error fetching student content', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const getContentByGrade = (grade: string): GradeContent | undefined => {
    return gradeContent.find(gc => gc.grade === grade);
  };

  const getCurrentGradeContent = (): GradeContent | undefined => {
    return getContentByGrade(currentGrade);
  };

  const getAllContentItems = (): StudentContentItem[] => {
    return gradeContent.flatMap(gc => [
      ...gc.videos,
      ...gc.documents,
      ...gc.projects,
      ...gc.lessons
    ]);
  };

  const getCompletedContentCount = (): number => {
    return getAllContentItems().filter(item => 
      item.progress?.progress_percentage === 100
    ).length;
  };

  const getTotalContentCount = (): number => {
    return getAllContentItems().length;
  };

  const getProgressPercentage = (): number => {
    const total = getTotalContentCount();
    const completed = getCompletedContentCount();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  useEffect(() => {
    if (availableGrades.length > 0) {
      fetchAllAvailableContent();
    }
  }, [user, userProfile, availableGrades]);

  return {
    gradeContent,
    currentGrade,
    setCurrentGrade,
    loading,
    error,
    availableGrades,
    isGradeAvailable,
    getContentByGrade,
    getCurrentGradeContent,
    getAllContentItems,
    getCompletedContentCount,
    getTotalContentCount,
    getProgressPercentage,
    refetch: fetchAllAvailableContent
  };
};