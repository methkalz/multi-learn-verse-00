import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useStudentAssignedGrade } from './useStudentAssignedGrade';
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
  lessons: StudentContentItem[];
}

export const useStudentContent = () => {
  const { user, userProfile } = useAuth();
  const { assignedGrade, loading: gradeLoading } = useStudentAssignedGrade();
  const [gradeContent, setGradeContent] = useState<GradeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContentForGrade = async (grade: string): Promise<GradeContent> => {
    try {
      // Initialize arrays
      let videos: StudentContentItem[] = [];
      let documents: StudentContentItem[] = [];
      let projects: StudentContentItem[] = [];
      let lessons: StudentContentItem[] = [];

      // Fetch videos based on grade
      try {
        const videoTable = grade === '10' ? 'grade10_videos' : 
                          grade === '11' ? 'grade11_videos' : 'grade12_videos';
        
        const response = await supabase
          .from(videoTable)
          .select('*')
          .eq('is_active', true)
          .eq('is_visible', true)
          .order('order_index', { ascending: true });
        
        if (response.data) {
          videos = response.data.map((item: any) => ({
            id: item.id,
            title: item.title || '',
            description: item.description,
            content_type: 'video' as const,
            grade_level: grade,
            category: item.category,
            video_url: item.video_url,
            thumbnail_url: item.thumbnail_url,
            duration: item.duration,
            is_visible: item.is_visible || true,
            is_active: item.is_active || true,
            order_index: item.order_index || 0,
            created_at: item.created_at,
          }));
        }
      } catch (err) {
        logger.warn('Could not fetch videos', { error: err });
      }

      // Fetch documents for grades 10 and 11
      try {
        if (grade === '10' || grade === '11') {
          const docTable = grade === '10' ? 'grade10_documents' : 'grade11_documents';
          const response = await supabase
            .from(docTable)
            .select('*')
            .eq('is_active', true)
            .eq('is_visible', true)
            .order('order_index', { ascending: true });
          
          if (response.data) {
            documents = response.data.map((item: any) => ({
              id: item.id,
              title: item.title || '',
              description: item.description,
              content_type: 'document' as const,
              grade_level: grade,
              category: item.category,
              file_path: item.file_path,
              is_visible: item.is_visible || true,
              is_active: item.is_active || true,
              order_index: item.order_index || 0,
              created_at: item.created_at,
            }));
          }
        }
      } catch (err) {
        logger.warn('Could not fetch documents', { error: err });
      }

      // Fetch projects for grade 10
      try {
        if (grade === '10' && user) {
          const response = await supabase
            .from('grade10_mini_projects')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

          if (response.data) {
            projects = response.data.map((item: any) => ({
              id: item.id,
              title: item.title || '',
              description: item.description,
              content_type: 'project' as const,
              grade_level: grade,
              is_visible: true,
              is_active: true,
              order_index: 0,
              created_at: item.created_at,
            }));
          }
        }
      } catch (err) {
        logger.warn('Could not fetch projects', { error: err });
      }

      // Fetch lessons for grade 11
      try {
        if (grade === '11') {
          const response = await supabase
            .from('grade11_lessons')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true });

          if (response.data) {
            lessons = response.data.map((item: any) => ({
              id: item.id,
              title: item.title || '',
              description: item.description || '',
              content_type: 'lesson' as const,
              grade_level: grade,
              is_visible: true,
              is_active: item.is_active || true,
              order_index: item.order_index || 0,
              created_at: item.created_at,
            }));
          }
        }
      } catch (err) {
        logger.warn('Could not fetch lessons', { error: err });
      }

      // Get progress data
      const allItems = [...videos, ...documents, ...projects, ...lessons];
      const allContentIds = allItems.map(item => item.id);

      if (allContentIds.length > 0 && user) {
        try {
          const response = await supabase
            .from('student_progress')
            .select('*')
            .eq('student_id', user.id)
            .in('content_id', allContentIds);

          if (response.data) {
            const progressMap = new Map();
            response.data.forEach((p: any) => {
              progressMap.set(`${p.content_id}-${p.content_type}`, {
                progress_percentage: p.progress_percentage,
                completed_at: p.completed_at,
                points_earned: p.points_earned,
                time_spent_minutes: p.time_spent_minutes
              });
            });

            // Add progress to items
            [videos, documents, projects, lessons].forEach(itemArray => {
              itemArray.forEach(item => {
                const progressKey = `${item.id}-${item.content_type}`;
                if (progressMap.has(progressKey)) {
                  item.progress = progressMap.get(progressKey);
                }
              });
            });
          }
        } catch (err) {
          logger.warn('Could not fetch progress data', { error: err });
        }
      }

      return {
        grade,
        videos,
        documents,
        projects,
        lessons
      };

    } catch (err) {
      logger.error(`Error fetching content for grade ${grade}`, err as Error);
      throw err;
    }
  };

  const fetchAssignedGradeContent = async () => {
    if (!user || userProfile?.role !== 'student' || !assignedGrade || gradeLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const content = await fetchContentForGrade(assignedGrade);
      setGradeContent(content);

      logger.info('Student content loaded successfully', { 
        grade: assignedGrade,
        contentCount: content.videos.length + content.documents.length + 
                     content.projects.length + content.lessons.length
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل المحتوى التعليمي';
      setError(errorMessage);
      logger.error('Error fetching student content', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const getAllContentItems = (): StudentContentItem[] => {
    if (!gradeContent) return [];
    
    return [
      ...gradeContent.videos,
      ...gradeContent.documents,
      ...gradeContent.projects,
      ...gradeContent.lessons
    ];
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
    if (!gradeLoading && assignedGrade) {
      fetchAssignedGradeContent();
    }
  }, [user, userProfile, assignedGrade, gradeLoading]);

  return {
    gradeContent,
    assignedGrade,
    loading: loading || gradeLoading,
    error,
    getAllContentItems,
    getCompletedContentCount,
    getTotalContentCount,
    getProgressPercentage,
    refetch: fetchAssignedGradeContent
  };
};