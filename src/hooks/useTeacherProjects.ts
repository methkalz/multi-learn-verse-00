import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface TeacherProject {
  id: string;
  title: string;
  description?: string;
  status: string;
  grade?: number;
  updated_at: string;
  created_at: string;
  student_id: string;
  student_name: string;
  school_id?: string;
  unread_comments_count: number;
  total_comments_count: number;
  completion_percentage: number;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  comment_text: string;
  comment_type: string;
  created_at: string;
  is_read: boolean;
  user_name: string;
  user_role: string;
}

export const useTeacherProjects = () => {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState<TeacherProject[]>([]);
  const [recentComments, setRecentComments] = useState<ProjectComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // جلب مشاريع طلاب المعلم
  const fetchTeacherProjects = async () => {
    if (!userProfile?.school_id) return;

    try {
      setLoading(true);
      setError(null);

      // استخدام الـ view المحسّن لجلب المشاريع
      const { data: projectsData, error: projectsError } = await supabase
        .from('teacher_projects_view')
        .select('*')
        .eq('school_id', userProfile.school_id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (projectsError) throw projectsError;

      // تحويل البيانات إلى التنسيق المطلوب
      const formattedProjects = (projectsData || []).map(project => ({
        ...project,
        student_name: project.student_name || 'اسم غير محدد',
        unread_comments_count: project.unread_comments_count || 0,
        total_comments_count: project.total_comments_count || 0,
        completion_percentage: project.completion_percentage || 0
      }));

      setProjects(formattedProjects);
    } catch (error: any) {
      console.error('Error fetching teacher projects:', error);
      setError(error.message);
      toast({
        title: 'خطأ في جلب المشاريع',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // جلب التعليقات الحديثة
  const fetchRecentComments = async () => {
    if (!userProfile?.school_id) return;

    try {
      // جلب التعليقات مع معلومات إضافية
      const { data: commentsData, error: commentsError } = await supabase
        .from('grade12_project_comments')
        .select(`
          id,
          project_id,
          created_by,
          comment,
          comment_type,
          created_at,
          is_read
        `)
        .neq('created_by', userProfile.user_id) // تعليقات من الطلاب فقط
        .order('created_at', { ascending: false })
        .limit(20);

      if (commentsError) throw commentsError;

      // تحويل البيانات مع جلب معلومات إضافية لكل تعليق
      const formattedComments = await Promise.all(
        (commentsData || []).map(async (comment) => {
          // جلب معلومات المشروع
          const { data: projectData } = await supabase
            .from('grade12_final_projects')
            .select('title, school_id')
            .eq('id', comment.project_id)
            .single();

          // جلب معلومات صاحب التعليق
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('user_id', comment.created_by)
            .single();

          // تحقق من أن المشروع ينتمي لمدرسة المعلم (تم الحذف لتبسيط المعالجة)

          return {
            id: comment.id,
            project_id: comment.project_id,
            user_id: comment.created_by,
            comment_text: comment.comment,
            comment_type: comment.comment_type,
            created_at: comment.created_at,
            is_read: comment.is_read,
            user_name: userProfile?.full_name || 'اسم غير محدد',
            user_role: userProfile?.role || 'student'
          };
        })
      );

      // فلترة التعليقات الصالحة فقط
      const validComments = formattedComments.filter(comment => comment !== null);

      setRecentComments(validComments);
    } catch (error: any) {
      console.error('Error fetching recent comments:', error);
      toast({
        title: 'خطأ في جلب التعليقات',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // تحديد التعليق كمقروء
  const markCommentAsRead = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('grade12_project_comments')
        .update({ is_read: true })
        .eq('id', commentId);

      if (error) throw error;

      // تحديث الحالة المحلية
      setRecentComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, is_read: true }
            : comment
        )
      );

      // تحديث عدد التعليقات غير المقروءة في المشاريع
      await fetchTeacherProjects();

    } catch (error: any) {
      console.error('Error marking comment as read:', error);
      toast({
        title: 'خطأ في تحديث حالة التعليق',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // إضافة تعليق جديد
  const addComment = async (projectId: string, commentText: string, commentType: string = 'comment') => {
    if (!userProfile?.user_id) return false;

    try {
      const { error } = await supabase
        .from('grade12_project_comments')
        .insert({
          project_id: projectId,
          created_by: userProfile.user_id,
          comment: commentText,
          comment_type: commentType,
          is_read: true // المعلم يقرأ تعليقه مباشرة
        });

      if (error) throw error;

      toast({
        title: 'تم إضافة التعليق',
        description: 'تم إضافة التعليق بنجاح'
      });

      // تحديث البيانات
      await fetchRecentComments();
      await fetchTeacherProjects();
      
      return true;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: 'خطأ في إضافة التعليق',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  // إحصائيات سريعة
  const getQuickStats = () => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
    const unreadCommentsTotal = projects.reduce((sum, p) => sum + p.unread_comments_count, 0);
    const averageCompletion = projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.completion_percentage, 0) / projects.length)
      : 0;

    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      unreadCommentsTotal,
      averageCompletion
    };
  };

  useEffect(() => {
    if (userProfile?.user_id && userProfile?.role === 'teacher') {
      fetchTeacherProjects();
      fetchRecentComments();
    }
  }, [userProfile]);

  // إعداد real-time subscription للتعليقات الجديدة
  useEffect(() => {
    if (!userProfile?.school_id) return;

    const channel = supabase
      .channel('teacher-project-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'grade12_project_comments'
        },
        () => {
          fetchRecentComments();
          fetchTeacherProjects();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'grade12_final_projects'
        },
        () => {
          fetchTeacherProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile?.school_id]);

  return {
    projects,
    recentComments,
    loading,
    error,
    quickStats: getQuickStats(),
    fetchTeacherProjects,
    fetchRecentComments,
    markCommentAsRead,
    addComment,
    refetch: () => {
      fetchTeacherProjects();
      fetchRecentComments();
    }
  };
};