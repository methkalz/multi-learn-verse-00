-- إضافة حقول التجميد لجدول الصفوف
ALTER TABLE public.classes 
ADD COLUMN frozen_reason TEXT,
ADD COLUMN frozen_at TIMESTAMP WITH TIME ZONE;

-- تحديث enum status ليشمل 'frozen'
CREATE TYPE class_status_new AS ENUM ('active', 'archived', 'frozen');
ALTER TABLE public.classes ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.classes ALTER COLUMN status TYPE class_status_new USING status::text::class_status_new;
ALTER TABLE public.classes ALTER COLUMN status SET DEFAULT 'active'::class_status_new;
DROP TYPE IF EXISTS class_status;
ALTER TYPE class_status_new RENAME TO class_status;

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

-- إنشاء trigger للتحقق من الصفوف عند تغيير الباقة
CREATE OR REPLACE FUNCTION public.check_classes_on_package_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إذا تم تغيير الباقة النشطة، تحقق من الصفوف
  IF OLD.active_package_id IS DISTINCT FROM NEW.active_package_id THEN
    PERFORM public.freeze_orphaned_classes();
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger على جدول المدارس
DROP TRIGGER IF EXISTS schools_package_change_trigger ON public.schools;
CREATE TRIGGER schools_package_change_trigger
  AFTER UPDATE OF active_package_id ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.check_classes_on_package_change();