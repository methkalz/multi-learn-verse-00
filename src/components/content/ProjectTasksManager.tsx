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
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Plus,
  Target,
  Trash2,
  Calendar,
  CheckCircle,
  Circle
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

  // رندر المهام بشكل هرمي
  const renderTasks = (taskList: any[], level: number = 0) => {
    return taskList.map((task) => (
      <div key={task.id} className={`space-y-3 ${level > 0 ? 'mr-6 border-r-2 border-gradient-to-b from-blue-200 to-purple-200 pr-4' : ''}`}>
        <div className={cn(
          "group relative p-5 rounded-xl border transition-all duration-300 hover:shadow-md",
          task.is_completed 
            ? "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-green-200/50 shadow-green-100/50" 
            : "bg-gradient-to-r from-slate-50/50 to-gray-50/50 border-slate-200/50 hover:border-blue-300/50",
          level > 0 && "bg-gradient-to-r from-blue-50/30 to-indigo-50/30"
        )}>
          {/* مؤشر أولوية المهمة */}
          <div className={cn(
            "absolute top-0 left-0 w-1 h-full rounded-r-full",
            task.is_completed ? "bg-gradient-to-b from-green-400 to-emerald-500" :
            task.task_type === 'main' ? "bg-gradient-to-b from-blue-400 to-indigo-500" :
            "bg-gradient-to-b from-purple-400 to-pink-500"
          )} />
          
          <div className="flex items-start gap-4">
            <div className="mt-1 relative">
              {task.is_completed ? (
                <div className="relative">
                  <CheckCircle 
                    className="h-6 w-6 text-green-500 cursor-pointer hover:text-green-600 transition-colors drop-shadow-sm" 
                    onClick={() => isStudent && handleToggleTask(task.id, false)}
                  />
                  <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
                </div>
              ) : (
                <Circle 
                  className="h-6 w-6 text-slate-400 hover:text-blue-500 cursor-pointer transition-all duration-200 hover:scale-110" 
                  onClick={() => isStudent && handleToggleTask(task.id, true)}
                />
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={cn(
                  "font-semibold text-base",
                  task.is_completed ? 'line-through text-slate-500' : 'text-slate-800'
                )}>
                  {task.title}
                </span>
                
                {task.task_type === 'sub' && (
                  <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                    فرعية
                  </Badge>
                )}
                
                {task.is_completed && (
                  <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                    ✓ مكتملة
                  </Badge>
                )}
              </div>
              
              {task.description && (
                <div className="p-3 rounded-lg bg-white/60 border border-slate-200/50">
                  <p className="text-sm text-slate-700 leading-relaxed">{task.description}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {task.due_date && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100/50 text-orange-700">
                    <Calendar className="h-3 w-3" />
                    <span>موعد الاستحقاق: {format(new Date(task.due_date), 'dd MMM yyyy', { locale: ar })}</span>
                  </div>
                )}
                
                {task.completed_at && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100/50 text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    <span>اكتملت في: {format(new Date(task.completed_at), 'dd MMM yyyy', { locale: ar })}</span>
                  </div>
                )}
              </div>
            </div>
            
            {isTeacher && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* رندر المهام الفرعية */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-4 space-y-2">
            {renderTasks(task.subtasks, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // الحصول على المهام الرئيسية لقائمة الاختيار
  const getMainTasks = (taskList: any[]): any[] => {
    return taskList.filter(task => task.task_type === 'main' || !task.parent_task_id);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* إحصائيات التقدم */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  تقدم المهام
                </CardTitle>
                <p className="text-sm text-slate-600">متابعة إنجاز المهام</p>
              </div>
            </div>
            <Badge variant="outline" className="px-4 py-2 bg-white/80 border-blue-200 text-blue-700 font-semibold shadow-sm">
              {getAllTasks(tasks).filter(t => t.is_completed).length} / {getAllTasks(tasks).length} مهمة
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700 font-medium">التقدم الإجمالي</span>
              <span className="font-bold text-blue-600">{calculateProgress()}%</span>
            </div>
            <div className="relative">
              <Progress 
                value={calculateProgress()} 
                className="h-3 bg-white/60 shadow-inner" 
              />
              <div className={cn(
                "absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg transition-all duration-500",
                calculateProgress() > 70 && "shadow-blue-500/30"
              )} style={{ width: `${calculateProgress()}%` }} />
            </div>
            {calculateProgress() === 100 && (
              <div className="text-center text-sm font-medium text-green-600 animate-bounce">
                🎉 تم إنجاز جميع المهام!
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة المهام */}
        <div className="lg:col-span-2">
          <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader className="bg-gradient-to-r from-slate-50/50 to-gray-50/50 border-b border-slate-200/50">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-slate-500 to-gray-500 text-white shadow-md">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
                    قائمة المهام
                  </span>
                  <p className="text-sm text-slate-500 font-normal">إدارة وتتبع المهام</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[500px] pr-2">
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="relative">
                        <Target className="h-20 w-20 mx-auto mb-6 text-slate-300" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">لا توجد مهام حتى الآن</h3>
                      <p className="text-slate-500">
                        {isTeacher ? '✨ قم بإضافة مهام للطالب لبدء المتابعة' : '⏳ انتظر حتى يضيف المعلم المهام'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {renderTasks(tasks)}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* نموذج إضافة مهمة جديدة - للمعلم فقط */}
        {isTeacher && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إضافة مهمة جديدة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="task-title">عنوان المهمة *</Label>
                <Input
                  id="task-title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="أدخل عنوان المهمة"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="task-description">الوصف</Label>
                <Textarea
                  id="task-description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="وصف المهمة (اختياري)"
                  rows={3}
                  className="mt-1"
                />
              </div>

              {getMainTasks(tasks).length > 0 && (
                <div>
                  <Label htmlFor="parent-task">المهمة الرئيسية (اختياري)</Label>
                  <select
                    id="parent-task"
                    value={selectedParentTask}
                    onChange={(e) => setSelectedParentTask(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">مهمة رئيسية</option>
                    {getMainTasks(tasks).map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <Button 
                onClick={handleAddTask} 
                className="w-full"
                disabled={!newTaskTitle.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة المهمة
              </Button>
            </CardContent>
          </Card>
        )}

        {/* معلومات للطالب */}
        {isStudent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إرشادات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• انقر على الدائرة لوضع علامة على المهمة كمكتملة</p>
              <p>• يمكنك إلغاء وضع علامة مكتملة بالنقر مرة أخرى</p>
              <p>• تقدمك يظهر في الشريط العلوي</p>
              <p>• المهام الفرعية تظهر تحت المهام الرئيسية</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectTasksManager;