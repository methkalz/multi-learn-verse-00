import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ProjectComment {
  id: string;
  project_id: string;
  created_by: string;
  comment: string;
  comment_type: string;
  is_read: boolean | null;
  created_at: string;
  // معلومات المستخدم من الـ profiles
  author?: {
    id: string;
    full_name: string;
    role: string;
  };
}

interface UseProjectCommentsOptions {
  projectId: string;
  enabled?: boolean;
}

export const useProjectComments = ({ projectId, enabled = true }: UseProjectCommentsOptions) => {
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // جلب التعليقات مع معلومات المؤلفين
  const fetchComments = async () => {
    if (!enabled || !projectId) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // جلب التعليقات أولاً
      const { data: commentsData, error: fetchError } = await supabase
        .from('grade12_project_comments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching comments:', fetchError);
        setError('فشل في تحميل التعليقات');
        return;
      }

      // جلب معلومات المؤلفين
      const authorIds = [...new Set(commentsData?.map(c => c.created_by) || [])];
      const { data: authorsData } = await supabase
        .from('profiles')
        .select('user_id, full_name, role')
        .in('user_id', authorIds);

      // دمج البيانات
      const authorsMap = new Map(authorsData?.map(author => [author.user_id, author]) || []);
      
      const commentsWithAuthor = (commentsData || []).map(comment => ({
        ...comment,
        author: authorsMap.get(comment.created_by) ? {
          id: comment.created_by,
          full_name: authorsMap.get(comment.created_by)?.full_name || 'مستخدم غير معروف',
          role: authorsMap.get(comment.created_by)?.role || 'student'
        } : undefined
      }));

      setComments(commentsWithAuthor);
      
      // حساب التعليقات غير المقروءة للمستخدم الحالي
      const unread = commentsWithAuthor.filter(
        comment => !comment.is_read && comment.created_by !== user?.id
      ).length;
      setUnreadCount(unread);

    } catch (err) {
      console.error('Error in fetchComments:', err);
      setError('حدث خطأ في تحميل التعليقات');
    } finally {
      setIsLoading(false);
    }
  };

  // إضافة تعليق جديد
  const addComment = async (
    commentText: string, 
    commentType: 'comment' | 'feedback' | 'grade' = 'comment'
  ) => {
    if (!user || !projectId || !commentText.trim()) {
      console.log('addComment: Missing required data', { user: !!user, projectId, commentText: !!commentText });
      return false;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      console.log('Attempting to add comment:', {
        project_id: projectId,
        created_by: user.id,
        comment: commentText.trim(),
        comment_type: commentType,
        user_role: user
      });

      const { data, error: insertError } = await supabase
        .from('grade12_project_comments')
        .insert({
          project_id: projectId,
          created_by: user.id,
          comment: commentText.trim(),
          comment_type: commentType,
          is_read: false
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Error adding comment:', insertError);
        console.error('Error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        setError('فشل في إضافة التعليق');
        toast({
          title: "خطأ",
          description: `فشل في إضافة التعليق: ${insertError.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Comment added successfully:', data);

      // جلب معلومات المؤلف
      const { data: authorData } = await supabase
        .from('profiles')
        .select('user_id, full_name, role')
        .eq('user_id', user.id)
        .single();

      // إضافة التعليق الجديد للقائمة محلياً
      if (data) {
        const newComment = {
          ...data,
          author: authorData ? {
            id: user.id,
            full_name: authorData.full_name || 'مستخدم غير معروف',
            role: authorData.role || 'student'
          } : undefined
        };
        setComments(prev => [...prev, newComment]);
      }

      toast({
        title: "تم بنجاح",
        description: "تم إضافة التعليق بنجاح",
      });

      return true;
    } catch (err) {
      console.error('Error in addComment:', err);
      setError('حدث خطأ في إضافة التعليق');
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // تحديد التعليق كمقروء
  const markAsRead = async (commentId: string) => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('grade12_project_comments')
        .update({ is_read: true })
        .eq('id', commentId)
        .neq('created_by', user.id); // لا نحدث التعليقات الخاصة بالمستخدم نفسه

      if (updateError) {
        console.error('Error marking comment as read:', updateError);
        return;
      }

      // تحديث الحالة محلياً
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, is_read: true } : comment
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error in markAsRead:', err);
    }
  };

  // تحديد جميع التعليقات كمقروءة
  const markAllAsRead = async () => {
    if (!user || !projectId) return;

    try {
      const { error: updateError } = await supabase
        .from('grade12_project_comments')
        .update({ is_read: true })
        .eq('project_id', projectId)
        .neq('created_by', user.id)
        .eq('is_read', false);

      if (updateError) {
        console.error('Error marking all comments as read:', updateError);
        return;
      }

      // تحديث الحالة محلياً
      setComments(prev => prev.map(comment => ({
        ...comment,
        is_read: comment.created_by === user.id ? comment.is_read : true
      })));
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error in markAllAsRead:', err);
    }
  };

  // إعداد real-time subscription للتعليقات
  useEffect(() => {
    if (!enabled || !projectId) return;

    fetchComments();

    // إعداد real-time subscription
    const channel = supabase
      .channel(`project_comments_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'grade12_project_comments',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          // جلب التعليق الجديد
          const { data: newComment } = await supabase
            .from('grade12_project_comments')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (newComment) {
            // جلب معلومات المؤلف
            const { data: authorData } = await supabase
              .from('profiles')
              .select('user_id, full_name, role')
              .eq('user_id', newComment.created_by)
              .single();

            const commentWithAuthor = {
              ...newComment,
              author: authorData ? {
                id: newComment.created_by,
                full_name: authorData.full_name || 'مستخدم غير معروف',
                role: authorData.role || 'student'
              } : undefined
            };

            setComments(prev => {
              // تجنب التكرار
              const exists = prev.find(c => c.id === commentWithAuthor.id);
              if (exists) return prev;
              return [...prev, commentWithAuthor];
            });

            // زيادة عدد التعليقات غير المقروءة إذا لم يكن من المستخدم الحالي
            if (newComment.created_by !== user?.id) {
              setUnreadCount(prev => prev + 1);
              
              // إشعار بصري للتعليق الجديد
              toast({
                title: "تعليق جديد",
                description: `${commentWithAuthor.author?.full_name || 'شخص ما'} أضاف تعليقاً جديداً`,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'grade12_project_comments',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          setComments(prev => prev.map(comment => 
            comment.id === payload.new.id 
              ? { ...comment, ...payload.new }
              : comment
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, projectId, user?.id]);

  return {
    comments,
    isLoading,
    isSubmitting,
    error,
    unreadCount,
    addComment,
    markAsRead,
    markAllAsRead,
    refetch: fetchComments
  };
};