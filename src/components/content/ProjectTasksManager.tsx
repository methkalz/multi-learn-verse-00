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
      <div key={task.id} className={`space-y-2 ${level > 0 ? 'mr-6 border-r border-border pr-4' : ''}`}>
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
          <div className="mt-1">
            {task.is_completed ? (
              <CheckCircle 
                className="h-5 w-5 text-green-500 cursor-pointer" 
                onClick={() => isStudent && handleToggleTask(task.id, false)}
              />
            ) : (
              <Circle 
                className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" 
                onClick={() => isStudent && handleToggleTask(task.id, true)}
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
            
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.due_date), 'dd MMM yyyy', { locale: ar })}</span>
              </div>
            )}
            
            {task.completed_at && (
              <div className="text-xs text-green-600">
                اكتملت في: {format(new Date(task.completed_at), 'dd MMM yyyy', { locale: ar })}
              </div>
            )}
          </div>
          
          {isTeacher && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteTask(task.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* رندر المهام الفرعية */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2">
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
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">تقدم المهام</CardTitle>
            <Badge variant="outline" className="px-3 py-1">
              {getAllTasks(tasks).filter(t => t.is_completed).length} / {getAllTasks(tasks).length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>التقدم الإجمالي</span>
              <span className="font-medium">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة المهام */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                قائمة المهام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Target className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg mb-2">لا توجد مهام حتى الآن</p>
                      <p className="text-sm">
                        {isTeacher ? 'قم بإضافة مهام للطالب' : 'انتظر حتى يضيف المعلم المهام'}
                      </p>
                    </div>
                  ) : (
                    renderTasks(tasks)
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