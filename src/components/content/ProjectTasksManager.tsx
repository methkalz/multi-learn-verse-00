import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGrade12Projects } from '@/hooks/useGrade12Projects';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Plus,
  Target,
  Trash2,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  User,
  Eye,
  Activity
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProjectTasksManagerProps {
  projectId: string;
  isTeacher: boolean;
  isStudent: boolean;
}

const ProjectTasksManager: React.FC<ProjectTasksManagerProps> = ({
  projectId,
  isTeacher,
  isStudent
}) => {
  const {
    tasks,
    fetchTasks,
    addTask,
    updateTaskStatus,
    deleteTask
  } = useGrade12Projects();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedParentTask, setSelectedParentTask] = useState<string>('');

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId, fetchTasks]);

  // إضافة real-time updates للمهام
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project_tasks_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grade12_project_tasks',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          // إعادة تحميل المهام عند حدوث تغيير
          fetchTasks(projectId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchTasks]);

  // حساب التقدم الإجمالي
  const calculateProgress = (): number => {
    if (tasks.length === 0) return 0;
    const allTasks = getAllTasks(tasks);
    const completedTasks = allTasks.filter(task => task.is_completed);
    return Math.round((completedTasks.length / allTasks.length) * 100);
  };

  // جلب جميع المهام (الرئيسية والفرعية)
  const getAllTasks = (taskList: any[]): any[] => {
    let allTasks: any[] = [];
    taskList.forEach(task => {
      allTasks.push(task);
      if (task.subtasks && task.subtasks.length > 0) {
        allTasks = allTasks.concat(getAllTasks(task.subtasks));
      }
    });
    return allTasks;
  };

  // إضافة مهمة جديدة
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "خطأ",
        description: "عنوان المهمة مطلوب",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTask({
        project_id: projectId,
        title: newTaskTitle,
        description: newTaskDescription,
        parent_task_id: selectedParentTask || null,
        task_type: selectedParentTask ? 'sub' : 'main',
        order_index: tasks.length,
      });
      
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedParentTask('');
      
      toast({
        title: "نجح",
        description: "تم إضافة المهمة بنجاح",
      });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // تحديث حالة المهمة
  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      await updateTaskStatus(taskId, isCompleted);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // حذف مهمة
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({
        title: "نجح",
        description: "تم حذف المهمة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // رندر المهام للمعلم مع تفاصيل أكثر
  const renderTasksForTeacher = (taskList: any[], level: number = 0) => {
    return taskList.map((task) => (
      <div key={task.id} className={`space-y-2 ${level > 0 ? 'mr-4 border-r-2 border-muted pr-4' : ''}`}>
        <div className={`p-4 border rounded-lg transition-all duration-200 ${
          task.is_completed 
            ? 'bg-green-50 border-green-200 hover:bg-green-100/50' 
            : 'bg-card border-border hover:bg-accent/10 hover:border-primary/20'
        }`}>
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {task.is_completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium text-base ${task.is_completed ? 'text-green-700' : 'text-foreground'}`}>
                      {task.title}
                    </span>
                    {task.task_type === 'sub' && (
                      <Badge variant="outline" className="text-xs">مهمة فرعية</Badge>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* معلومات التقدم والتوقيت */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>أُضيفت: {format(new Date(task.created_at), 'dd MMM yyyy - HH:mm', { locale: ar })}</span>
                </div>
                
                {task.is_completed && task.completed_at && (
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle className="h-3 w-3" />
                    <span>اكتملت: {format(new Date(task.completed_at), 'dd MMM yyyy - HH:mm', { locale: ar })}</span>
                  </div>
                )}

                <Badge 
                  variant={task.is_completed ? "default" : "secondary"} 
                  className={`text-xs ${
                    task.is_completed 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {task.is_completed ? 'مكتملة ✓' : 'في انتظار الإنجاز'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* رندر المهام الفرعية */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-3 space-y-2">
            {renderTasksForTeacher(task.subtasks, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // رندر المهام للطالب (مبسط للتفاعل)
  const renderTasksForStudent = (taskList: any[], level: number = 0) => {
    return taskList.map((task) => (
      <div key={task.id} className={`space-y-2 ${level > 0 ? 'mr-4 border-r border-border pr-3' : ''}`}>
        <div className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <div className="mt-1">
            {task.is_completed ? (
              <CheckCircle 
                className="h-5 w-5 text-green-500 cursor-pointer hover:text-green-600" 
                onClick={() => handleToggleTask(task.id, false)}
              />
            ) : (
              <Circle 
                className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" 
                onClick={() => handleToggleTask(task.id, true)}
              />
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </span>
              {task.task_type === 'sub' && (
                <Badge variant="outline" className="text-xs">فرعية</Badge>
              )}
              {task.is_completed && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-700">مكتملة</Badge>
              )}
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
            
            {task.completed_at && (
              <div className="text-xs text-green-600">
                اكتملت في: {format(new Date(task.completed_at), 'dd MMM yyyy', { locale: ar })}
              </div>
            )}
          </div>
        </div>
        
        {/* رندر المهام الفرعية */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2">
            {renderTasksForStudent(task.subtasks, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // الحصول على المهام الرئيسية لقائمة الاختيار
  const getMainTasks = (taskList: any[]): any[] => {
    return taskList.filter(task => task.task_type === 'main' || !task.parent_task_id);
  };

  const allTasks = getAllTasks(tasks);
  const completedTasks = allTasks.filter(t => t.is_completed);
  const progressPercentage = calculateProgress();

  return (
    <div className="h-full flex flex-col gap-6">
      {/* إحصائيات التقدم المحسنة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المهام المكتملة</p>
                <p className="text-2xl font-bold text-primary">{completedTasks.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المهام</p>
                <p className="text-2xl font-bold text-secondary">{allTasks.length}</p>
              </div>
              <Target className="h-8 w-8 text-secondary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نسبة الإنجاز</p>
                <p className="text-2xl font-bold text-green-600">{progressPercentage}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-500/60" />
            </div>
            <Progress value={progressPercentage} className="h-2 mt-2 bg-green-100" />
          </CardContent>
        </Card>
      </div>

      {isTeacher ? (
        /* واجهة المعلم المحسنة */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  مراقبة تقدم الطالب
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  عرض مفصل لحالة المهام وأوقات الإنجاز
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4 pr-2">
                    {tasks.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Target className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg mb-2">لا توجد مهام مضافة حتى الآن</p>
                        <p className="text-sm">ابدأ بإضافة مهام للطالب من القائمة الجانبية</p>
                      </div>
                    ) : (
                      renderTasksForTeacher(tasks)
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* نموذج إضافة مهمة جديدة - محسن للمعلم */}
          <Card className="h-fit">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                إضافة مهمة جديدة
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                إضافة مهام مخصصة لهذا المشروع
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <Label htmlFor="task-title" className="text-sm font-medium">عنوان المهمة *</Label>
                <Input
                  id="task-title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="أدخل عنوان المهمة"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="task-description" className="text-sm font-medium">الوصف التفصيلي</Label>
                <Textarea
                  id="task-description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="اكتب وصفاً مفصلاً للمهمة وما هو مطلوب من الطالب..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              {getMainTasks(tasks).length > 0 && (
                <div>
                  <Label htmlFor="parent-task" className="text-sm font-medium">ربط بمهمة رئيسية (اختياري)</Label>
                  <select
                    id="parent-task"
                    value={selectedParentTask}
                    onChange={(e) => setSelectedParentTask(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-input bg-background rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">إنشاء كمهمة رئيسية</option>
                    {getMainTasks(tasks).map((task) => (
                      <option key={task.id} value={task.id}>
                        إضافة كمهمة فرعية لـ: {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <Button 
                onClick={handleAddTask} 
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                disabled={!newTaskTitle.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة المهمة للطالب
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* واجهة الطالب المحسنة */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              مهامي الإضافية
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              مهام خاصة أضافها المعلم لمشروعك
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-2">
                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg mb-2">لا توجد مهام إضافية حتى الآن</p>
                    <p className="text-sm">انتظر حتى يضيف المعلم مهاماً مخصصة لمشروعك</p>
                  </div>
                ) : (
                  <>
                    {renderTasksForStudent(tasks)}
                    <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-blue-900 mb-2">💡 نصائح مهمة:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• انقر على الدائرة لوضع علامة على المهمة كمكتملة</li>
                          <li>• يمكنك إلغاء وضع علامة مكتملة بالنقر مرة أخرى</li>
                          <li>• تقدمك يظهر في الإحصائيات العلوية</li>
                          <li>• المهام الفرعية تظهر تحت المهام الرئيسية</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectTasksManager;