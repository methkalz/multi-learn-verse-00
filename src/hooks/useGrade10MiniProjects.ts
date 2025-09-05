import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Grade10MiniProject, Grade10ProjectTask, Grade10ProjectComment, Grade10ProjectFile, ProjectFormData, TaskFormData, CommentFormData } from '@/types/grade10-projects';

export const useGrade10MiniProjects = () => {
  const [projects, setProjects] = useState<Grade10MiniProject[]>([]);
  const [currentProject, setCurrentProject] = useState<Grade10MiniProject | null>(null);
  const [tasks, setTasks] = useState<Grade10ProjectTask[]>([]);
  const [comments, setComments] = useState<Grade10ProjectComment[]>([]);
  const [files, setFiles] = useState<Grade10ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

  // جلب جميع المشاريع
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('grade10_mini_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []) as Grade10MiniProject[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('حدث خطأ في جلب المشاريع');
    } finally {
      setLoading(false);
    }
  };

  // جلب مشروع محدد
  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('grade10_mini_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setCurrentProject(data as Grade10MiniProject);
      
      // جلب المهام والتعليقات والملفات المرتبطة
      await Promise.all([
        fetchTasks(projectId),
        fetchComments(projectId),
        fetchFiles(projectId)
      ]);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('حدث خطأ في جلب المشروع');
    } finally {
      setLoading(false);
    }
  };

  // إنشاء مشروع جديد
  const createProject = async (projectData: ProjectFormData) => {
    try {
      if (!userProfile?.user_id || !userProfile?.school_id) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      const { data, error } = await supabase
        .from('grade10_mini_projects')
        .insert({
          ...projectData,
          student_id: userProfile.user_id,
          school_id: userProfile.school_id,
          status: 'draft' as const,
          content: '',
          progress_percentage: 0
        })
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [(data as Grade10MiniProject), ...prev]);
      toast.success('تم إنشاء المشروع بنجاح');
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('حدث خطأ في إنشاء المشروع');
    }
  };

  // تحديث محتوى المشروع
  const updateProjectContent = async (projectId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('grade10_mini_projects')
        .update({ content })
        .eq('id', projectId);

      if (error) throw error;
      
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(prev => prev ? { ...prev, content } : null);
      }
      
      toast.success('تم حفظ المحتوى');
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('حدث خطأ في حفظ المحتوى');
    }
  };

  // تحديث حالة المشروع
  const updateProjectStatus = async (projectId: string, status: Grade10MiniProject['status']) => {
    try {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.progress_percentage = 100;
      }

      const { error } = await supabase
        .from('grade10_mini_projects')
        .update(updateData)
        .eq('id', projectId);

      if (error) throw error;
      
      setProjects(prev => 
        prev.map(p => 
          p.id === projectId 
            ? { ...p, ...updateData } 
            : p
        )
      );
      
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(prev => prev ? { ...prev, ...updateData } : null);
      }
      
      toast.success('تم تحديث حالة المشروع');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('حدث خطأ في تحديث الحالة');
    }
  };

  // جلب المهام
  const fetchTasks = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('grade10_project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setTasks((data || []) as Grade10ProjectTask[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // إضافة مهمة جديدة
  const addTask = async (projectId: string, taskData: TaskFormData) => {
    try {
      if (!userProfile?.user_id) return;

      const { data, error } = await supabase
        .from('grade10_project_tasks')
        .insert({
          ...taskData,
          project_id: projectId,
          created_by: userProfile.user_id,
          order_index: taskData.order_index ?? tasks.length
        })
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [...prev, data as Grade10ProjectTask]);
      toast.success('تم إضافة المهمة');
      return data;
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('حدث خطأ في إضافة المهمة');
    }
  };

  // تحديث حالة المهمة
  const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    try {
      const updateData: any = { is_completed: isCompleted };
      if (isCompleted) {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('grade10_project_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, ...updateData } 
            : task
        )
      );

      // حساب نسبة التقدم
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...updateData } : task
      );
      const completedCount = updatedTasks.filter(task => task.is_completed).length;
      const progressPercentage = updatedTasks.length > 0 
        ? Math.round((completedCount / updatedTasks.length) * 100) 
        : 0;

      // تحديث نسبة التقدم في المشروع
      if (currentProject) {
        await supabase
          .from('grade10_mini_projects')
          .update({ progress_percentage: progressPercentage })
          .eq('id', currentProject.id);

        setCurrentProject(prev => 
          prev ? { ...prev, progress_percentage: progressPercentage } : null
        );
      }

    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('حدث خطأ في تحديث المهمة');
    }
  };

  // جلب التعليقات
  const fetchComments = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('grade10_project_comments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((data || []) as Grade10ProjectComment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // إضافة تعليق
  const addComment = async (projectId: string, commentData: CommentFormData) => {
    try {
      if (!userProfile?.user_id) return;

      const { data, error } = await supabase
        .from('grade10_project_comments')
        .insert({
          ...commentData,
          project_id: projectId,
          user_id: userProfile.user_id
        })
        .select()
        .single();

      if (error) throw error;
      
      setComments(prev => [...prev, data as Grade10ProjectComment]);
      toast.success('تم إضافة التعليق');
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('حدث خطأ في إضافة التعليق');
    }
  };

  // جلب الملفات
  const fetchFiles = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('grade10_project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles((data || []) as Grade10ProjectFile[]);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // رفع ملف
  const uploadFile = async (projectId: string, file: File) => {
    try {
      if (!userProfile?.user_id) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `grade10-projects/${projectId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('grade10-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('grade10_project_files')
        .insert({
          project_id: projectId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: userProfile.user_id,
          is_image: file.type.startsWith('image/')
        })
        .select()
        .single();

      if (error) throw error;
      
      setFiles(prev => [data as Grade10ProjectFile, ...prev]);
      toast.success('تم رفع الملف بنجاح');
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('حدث خطأ في رفع الملف');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    currentProject,
    tasks,
    comments,
    files,
    loading,
    fetchProjects,
    fetchProject,
    createProject,
    updateProjectContent,
    updateProjectStatus,
    fetchTasks,
    addTask,
    toggleTaskCompletion,
    fetchComments,
    addComment,
    fetchFiles,
    uploadFile,
    setCurrentProject
  };
};