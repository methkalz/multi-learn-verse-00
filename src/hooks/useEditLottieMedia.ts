import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { Grade11LessonMedia } from './useGrade11Content';

export const useEditLottieMedia = () => {
  const queryClient = useQueryClient();

  const updateLottieMedia = useMutation({
    mutationFn: async ({
      mediaId,
      updates
    }: {
      mediaId: string;
      updates: Partial<Grade11LessonMedia>;
    }) => {
      const { error } = await supabase
        .from('grade11_lesson_media')
        .update({
          file_name: updates.file_name,
          metadata: updates.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', mediaId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch grade 11 content data
      queryClient.invalidateQueries({ queryKey: ['grade11-sections'] });
    },
    onError: (error) => {
      logger.error('Error updating Lottie media', error as Error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث ملف اللوتي",
        variant: "destructive",
      });
    }
  });

  return {
    updateLottieMedia: updateLottieMedia.mutateAsync,
    isUpdating: updateLottieMedia.isPending
  };
};