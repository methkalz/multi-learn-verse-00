import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, User, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  comment_text: string;
  comment_type: 'comment' | 'feedback' | 'grade';
  user_id: string;
  created_at: string;
  updated_at: string;
  is_private: boolean;
  // معلومات إضافية من profiles
  user_profile?: {
    full_name: string;
    role: string;
  };
}

interface ProjectCommentsSectionProps {
  projectId: string;
  className?: string;
}

export const ProjectCommentsSection: React.FC<ProjectCommentsSectionProps> = ({
  projectId,
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommentsCount, setNewCommentsCount] = useState(0);

  // جلب التعليقات
  const fetchComments = async () => {
    if (!projectId) return;

    try {
      // محاولة جلب التعليقات من جدول مؤقت (إذا كان موجوداً)
      // إذا لم يكن موجود، سنستخدم حلول أخرى
      setComments([]);
      setIsLoading(false);
    } catch (error) {
      console.error('خطأ في جلب التعليقات:', error);
      setIsLoading(false);
    }
  };

  // إضافة تعليق جديد
  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !projectId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // للآن سنخزن التعليق في localStorage حتى يتم إنشاء الجدول
      const comment: Comment = {
        id: Date.now().toString(),
        comment_text: newComment.trim(),
        comment_type: 'comment',
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_private: false,
        user_profile: {
          full_name: user.user_metadata?.full_name || 'مستخدم',
          role: user.user_metadata?.role || 'student'
        }
      };

      const existingComments = JSON.parse(
        localStorage.getItem(`project_comments_${projectId}`) || '[]'
      );
      const updatedComments = [...existingComments, comment];
      localStorage.setItem(`project_comments_${projectId}`, JSON.stringify(updatedComments));
      
      setComments(updatedComments);
      setNewComment('');
      
      toast({
        title: "تم إضافة التعليق",
        description: "تم إضافة تعليقك بنجاح",
      });

      // إنشاء إشعار للطرف الآخر
      if (comment.user_profile.role === 'student') {
        setNewCommentsCount(prev => prev + 1);
      }

    } catch (error) {
      console.error('خطأ في إضافة التعليق:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة التعليق",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // جلب التعليقات من localStorage
  useEffect(() => {
    const existingComments = JSON.parse(
      localStorage.getItem(`project_comments_${projectId}`) || '[]'
    );
    setComments(existingComments);
    setIsLoading(false);
  }, [projectId]);

  // تحديث عدد التعليقات الجديدة
  useEffect(() => {
    const unreadComments = comments.filter(comment => 
      comment.user_id !== user?.id && 
      comment.user_profile?.role !== user?.user_metadata?.role
    ).length;
    setNewCommentsCount(unreadComments);
  }, [comments, user]);

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="mr-2 text-sm text-muted-foreground">جاري تحميل التعليقات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            التعليقات والملاحظات
          </div>
          {newCommentsCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {newCommentsCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* قائمة التعليقات */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد تعليقات بعد</p>
              <p className="text-sm">كن أول من يضيف تعليق على هذا المشروع</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  comment.user_id === user?.id 
                    ? "bg-primary/5 border-primary/20 mr-8" 
                    : "bg-muted/50 border-border ml-8"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {comment.user_profile?.full_name || 'مستخدم'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {comment.user_profile?.role === 'teacher' ? 'معلم' : 
                         comment.user_profile?.role === 'student' ? 'طالب' : 'مستخدم'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(comment.created_at).toLocaleDateString('ar', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {comment.comment_text}
                </p>
                {comment.comment_type !== 'comment' && (
                  <Badge 
                    variant={comment.comment_type === 'grade' ? 'destructive' : 'secondary'} 
                    className="mt-2 text-xs"
                  >
                    {comment.comment_type === 'feedback' ? 'ملاحظة' : 'تقييم'}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>

        {/* إضافة تعليق جديد */}
        {user && (
          <div className="border-t pt-4 space-y-3">
            <Textarea
              placeholder="أضف تعليقك أو ملاحظتك على المشروع..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none"
              dir="rtl"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                سيتمكن المعلم والطالب من رؤية هذا التعليق
              </p>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmitting}
                size="sm"
                className="gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                إضافة تعليق
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};