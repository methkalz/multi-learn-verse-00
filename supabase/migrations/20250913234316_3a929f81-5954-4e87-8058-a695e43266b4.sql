-- أولاً، احذف view teacher_assigned_grades مؤقتاً
DROP VIEW IF EXISTS teacher_assigned_grades CASCADE;

-- إضافة حقول التجميد لجدول الصفوف
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS frozen_reason TEXT,
ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMP WITH TIME ZONE;

-- تحديث enum status ليشمل 'frozen'
DO $$
BEGIN
  -- إنشاء نوع جديد
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_status_new') THEN
    CREATE TYPE class_status_new AS ENUM ('active', 'archived', 'frozen');
  END IF;
  
  -- تحديث العمود
  ALTER TABLE public.classes ALTER COLUMN status DROP DEFAULT;
  ALTER TABLE public.classes ALTER COLUMN status TYPE class_status_new USING status::text::class_status_new;
  ALTER TABLE public.classes ALTER COLUMN status SET DEFAULT 'active'::class_status_new;
  
  -- حذف النوع القديم إذا وجد
  DROP TYPE IF EXISTS class_status CASCADE;
  
  -- إعادة تسمية النوع الجديد
  ALTER TYPE class_status_new RENAME TO class_status;
END $$;

-- إعادة إنشاء view teacher_assigned_grades
CREATE OR REPLACE VIEW teacher_assigned_grades AS
SELECT 
  tc.teacher_id,
  gl.label as grade_level_label,
  c.status
FROM public.teacher_classes tc
JOIN public.classes c ON tc.class_id = c.id
JOIN public.grade_levels gl ON c.grade_level_id = gl.id
WHERE c.status IN ('active', 'frozen'); -- تضمين الصفوف المجمدة

-- إنشاء دالة للكشف عن الصفوف المتيتمة وتجميدها
CREATE OR REPLACE FUNCTION public.freeze_orphaned_classes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- تجميد الصفوف التي لم تعد متاحة في الباقة النشطة
  UPDATE public.classes
  SET 
    status = 'frozen'::class_status,
    frozen_reason = 'grade_not_available_in_current_package',
    frozen_at = now()
  WHERE status = 'active'::class_status
    AND NOT EXISTS (
      SELECT 1 
      FROM public.schools s
      JOIN public.packages p ON s.active_package_id = p.id
      WHERE s.id = classes.school_id
        AND classes.grade_level_id IN (
          SELECT gl.id 
          FROM public.grade_levels gl
          WHERE gl.label = ANY(p.available_grade_contents)
        )
    );
END;
$$;

-- إنشاء دالة للحصول على الصفوف المتاحة للمدرسة
CREATE OR REPLACE FUNCTION public.get_available_grade_levels(school_uuid uuid)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(p.available_grade_contents, ARRAY[]::text[])
  FROM public.schools s
  LEFT JOIN public.packages p ON s.active_package_id = p.id
  WHERE s.id = school_uuid;
$$;