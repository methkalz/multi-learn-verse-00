-- إضافة عمود updated_at إذا لم يكن موجوداً
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT now();

-- إضافة حقول التجميد لجدول الصفوف
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS frozen_reason TEXT,
ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMP WITH TIME ZONE;

-- إضافة عمود status جديد مؤقت
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS status_new TEXT;

-- تحديث العمود الجديد
UPDATE public.classes SET status_new = status::text;

-- حذف العمود القديم
ALTER TABLE public.classes DROP COLUMN IF EXISTS status;

-- إعادة تسمية العمود الجديد
ALTER TABLE public.classes RENAME COLUMN status_new TO status;

-- إنشاء constraint للتحقق من القيم
ALTER TABLE public.classes ADD CONSTRAINT classes_status_check 
CHECK (status IN ('active', 'archived', 'frozen'));

-- تعيين القيمة الافتراضية
ALTER TABLE public.classes ALTER COLUMN status SET DEFAULT 'active';

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