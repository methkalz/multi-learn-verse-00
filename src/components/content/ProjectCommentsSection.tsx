import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Clock, Eye, EyeOff, Send, Loader2, Star, User, FileText, Award, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useProjectComments } from '@/hooks/useProjectComments';
import { cn } from '@/lib/utils';

interface ProjectCommentsSectionProps {
  projectId: string;
  className?: string;
}

export const ProjectCommentsSection: React.FC<ProjectCommentsSectionProps> = ({ 
  projectId, 
  className 
}) => {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<string>('comment');
  
  const { user } = useAuth();
  const {
    comments,
    isLoading,
    isSubmitting,
    error,
    unreadCount,
    addComment,
    markAsRead,
    markAllAsRead
  } = useProjectComments({ projectId, enabled: !!projectId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const success = await addComment(newComment, commentType as 'comment' | 'feedback' | 'grade');
    if (success) {
      setNewComment('');
      setCommentType('comment');
    }
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'feedback':
        return <FileText className="h-4 w-4" />;
      case 'grade':
        return <Award className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'feedback':
        return 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 border-blue-200 shadow-sm';
      case 'grade': 
        return 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-700 border-amber-200 shadow-sm';
      default:
        return 'bg-gradient-to-r from-slate-500/10 to-gray-500/10 text-slate-700 border-slate-200 shadow-sm';
    }
  };

  const getCommentTypeLabel = (type: string) => {
    switch (type) {
      case 'feedback':
        return 'ملاحظة';
      case 'grade':
        return 'تقييم';
      default:
        return 'تعليق';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 border-purple-200 shadow-sm';
      case 'school_admin':
        return 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 border-indigo-200 shadow-sm';
      case 'superadmin':
        return 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-700 border-pink-200 shadow-sm';
      case 'student':
        return 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 border-emerald-200 shadow-sm';
      default:
        return 'bg-gradient-to-r from-slate-500/10 to-gray-500/10 text-slate-700 border-slate-200 shadow-sm';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'معلم';
      case 'school_admin':
        return 'مدير مدرسة';
      case 'superadmin':
        return 'مدير عام';
      case 'student':
        return 'طالب';
      default:
        return 'مستخدم';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin ml-2" />
            <span>جاري تحميل التعليقات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50", className)}>
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-t-lg border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                التعليقات والملاحظات
              </span>
              {comments.length > 0 && (
                <Badge variant="secondary" className="mr-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                  {comments.length}
                </Badge>
              )}
            </div>
          </CardTitle>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 shadow-md animate-pulse">
                <Eye className="h-3 w-3" />
                {unreadCount} جديد
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-blue-200 text-blue-700"
              >
                تحديد الكل كمقروء
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* قائمة التعليقات */}
        <ScrollArea className="h-96">
          <div className="space-y-4 pr-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>لا توجد تعليقات بعد</p>
                <p className="text-sm">كن أول من يضيف تعليقاً على هذا المشروع</p>
              </div>
            ) : (
              comments.map((comment) => {
                const isOwn = comment.created_by === user?.id;
                const isUnread = !comment.is_read && !isOwn;
                
                return (
                  <div
                    key={comment.id}
                    className={cn(
                      "relative p-5 rounded-xl border transition-all duration-300 hover:shadow-md",
                      isOwn 
                        ? "bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200/50 mr-4 shadow-sm" 
                        : "bg-gradient-to-br from-slate-50/50 to-gray-50/50 border-slate-200/50 ml-4 shadow-sm",
                      isUnread && "ring-2 ring-blue-400/30 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg animate-fade-in"
                    )}
                    onClick={() => isUnread && markAsRead(comment.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className={cn(
                          "h-10 w-10 shrink-0 border-2 shadow-md",
                          isOwn ? "border-blue-200" : "border-slate-200"
                        )}>
                          <AvatarImage src="" alt={comment.author?.full_name} />
                          <AvatarFallback className={cn(
                            "text-sm font-medium",
                            comment.author?.role === 'teacher' ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white" :
                            comment.author?.role === 'student' ? "bg-gradient-to-br from-emerald-500 to-green-500 text-white" :
                            "bg-gradient-to-br from-slate-400 to-gray-400 text-white"
                          )}>
                            {comment.author?.full_name 
                              ? getInitials(comment.author.full_name)
                              : <User className="h-4 w-4" />
                            }
                          </AvatarFallback>
                        </Avatar>
                        {/* مؤشر الدور */}
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                          comment.author?.role === 'teacher' ? "bg-purple-500" :
                          comment.author?.role === 'student' ? "bg-emerald-500" :
                          "bg-slate-400"
                        )} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="font-semibold text-sm text-slate-800">
                            {comment.author?.full_name || 'مستخدم غير معروف'}
                          </span>
                          
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs font-medium px-2 py-1", getRoleColor(comment.author?.role || 'student'))}
                          >
                            {getRoleLabel(comment.author?.role || 'student')}
                          </Badge>
                          
                          <Badge 
                            variant="outline"
                            className={cn("text-xs font-medium px-2 py-1 flex items-center gap-1", getCommentTypeColor(comment.comment_type))}
                          >
                            {getCommentTypeIcon(comment.comment_type)}
                            <span>{getCommentTypeLabel(comment.comment_type)}</span>
                          </Badge>
                          
                          {isUnread && (
                            <Badge variant="destructive" className="text-xs bg-gradient-to-r from-red-500 to-pink-500 animate-pulse">
                              <EyeOff className="h-3 w-3 ml-1" />
                              جديد
                            </Badge>
                          )}
                        </div>
                        
                        <div className={cn(
                          "p-3 rounded-lg mb-3",
                          comment.comment_type === 'grade' ? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200" :
                          comment.comment_type === 'feedback' ? "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200" :
                          "bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200"
                        )}>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {comment.comment}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                              locale: ar
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* نموذج إضافة تعليق جديد */}
        {user && (
          <div className="bg-gradient-to-r from-slate-50/50 to-gray-50/50 rounded-xl p-5 border border-slate-200/50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-8 w-8 border-2 border-blue-200 shadow-sm">
                  <AvatarImage src="" alt={user.email} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium text-xs">
                    {user.email ? getInitials(user.email) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Select value={commentType} onValueChange={setCommentType}>
                    <SelectTrigger className="w-40 border-slate-300 bg-white shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comment" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        تعليق
                      </SelectItem>
                      <SelectItem value="feedback" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        ملاحظة
                      </SelectItem>
                      <SelectItem value="grade" className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        تقييم
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب تعليقك هنا..."
                className="min-h-24 resize-none border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                disabled={isSubmitting}
              />
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {newComment.length}/500 حرف
                </span>
                
                <Button 
                  type="submit" 
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {!user && (
          <div className="text-center py-4 text-muted-foreground">
            <p>يجب تسجيل الدخول لإضافة تعليق</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};