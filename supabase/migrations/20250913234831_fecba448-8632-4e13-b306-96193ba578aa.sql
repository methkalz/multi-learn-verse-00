-- حذف view مؤقتاً لتجنب التعارض
DROP VIEW IF EXISTS teacher_assigned_grades CASCADE;

-- أولاً، إصلاح دالة update_updated_at_column لتدعم الحقول المختلفة
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- تحقق من وجود الحقول المختلفة وحدثها
  IF TG_RELNAME = 'classes' THEN
    NEW.updated_at_utc = now();
  ELSE
    -- للجداول الأخرى، تحقق من وجود الحقل
    BEGIN
      NEW.updated_at = now();
    EXCEPTION WHEN undefined_column THEN
      -- إذا لم يوجد updated_at، جرب updated_at_utc
      NEW.updated_at_utc = now();
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إضافة حقول التجميد لجدول الصفوف
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS frozen_reason TEXT,
ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMP WITH TIME ZONE;

-- إضافة عمود status جديد مؤقت
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'status_new') THEN
    ALTER TABLE public.classes ADD COLUMN status_new TEXT;
  END IF;
END
$$;

-- تحديث العمود الجديد
UPDATE public.classes SET status_new = status WHERE status_new IS NULL;

-- حذف العمود القديم
ALTER TABLE public.classes DROP CONSTRAINT IF EXISTS classes_status_check;
ALTER TABLE public.classes DROP COLUMN IF EXISTS status CASCADE;

-- إعادة تسمية العمود الجديد
ALTER TABLE public.classes RENAME COLUMN status_new TO status;

-- إنشاء constraint للتحقق من القيم
ALTER TABLE public.classes ADD CONSTRAINT classes_status_check 
CHECK (status IN ('active', 'archived', 'frozen'));

-- تعيين القيمة الافتراضية
ALTER TABLE public.classes ALTER COLUMN status SET DEFAULT 'active';

-- إنشاء دالة للحصول على الصفوف المتاحة للمدرسة (تصحيح العلاقة)
CREATE OR REPLACE FUNCTION public.get_available_grade_levels(school_uuid uuid)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(p.available_grade_contents::text[], ARRAY[]::text[])
  FROM public.schools s
  LEFT JOIN public.packages p ON s.plan::text = p.name
  WHERE s.id = school_uuid AND p.is_active = true;
$$;

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
    status = 'frozen',
    frozen_reason = 'grade_not_available_in_current_package',
    frozen_at = now(),
    updated_at_utc = now()
  WHERE status = 'active'
    AND NOT EXISTS (
      SELECT 1 
      FROM public.schools s
      JOIN public.packages p ON s.plan::text = p.name
      WHERE s.id = classes.school_id
        AND p.is_active = true
        AND classes.grade_level_id IN (
          SELECT gl.id 
          FROM public.grade_levels gl
          WHERE ('grade' || gl.label) = ANY(p.available_grade_contents::text[])
        )
    );
END;
$$;

-- إعادة إنشاء view teacher_assigned_grades
CREATE OR REPLACE VIEW teacher_assigned_grades AS
SELECT 
  tc.teacher_id,
  gl.label as grade_level_label,
  c.status
FROM public.teacher_classes tc
JOIN public.classes c ON tc.class_id = c.id
JOIN public.grade_levels gl ON c.grade_level_id = gl.id
WHERE c.status IN ('active', 'frozen');

-- إعادة إنشاء trigger للحقل updated_at_utc
DROP TRIGGER IF EXISTS update_classes_updated_at_utc ON public.classes;
CREATE TRIGGER update_classes_updated_at_utc
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- تشغيل دالة تجميد الصفوف المتيتمة لأول مرة
SELECT public.freeze_orphaned_classes();