import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

export const useAvailableGrades = () => {
  const { userProfile } = useAuth();
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableGrades = async () => {
    if (!userProfile?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_available_grade_levels', { school_uuid: userProfile.school_id });

      if (fetchError) {
        throw fetchError;
      }

      setAvailableGrades(data || []);
      logger.info('Available grades loaded', { grades: data });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل الصفوف المتاحة';
      setError(errorMessage);
      logger.error('Error fetching available grades', err as Error);
      // Fallback to default grades
      setAvailableGrades(['10', '11', '12']);
    } finally {
      setLoading(false);
    }
  };

  const isGradeAvailable = (grade: string): boolean => {
    return availableGrades.includes(grade);
  };

  useEffect(() => {
    if (userProfile?.school_id) {
      fetchAvailableGrades();
    }
  }, [userProfile?.school_id]);

  return {
    availableGrades,
    isGradeAvailable,
    loading,
    error,
    refetch: fetchAvailableGrades
  };
};