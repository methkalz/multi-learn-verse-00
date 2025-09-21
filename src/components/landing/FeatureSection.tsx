/**
 * Feature Section Component
 * Displays detailed features for different user types
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, GraduationCap, BookOpen, School } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
}

interface FeatureSectionProps {
  type: 'teacher' | 'student' | 'admin';
}

const featureData = {
  teacher: {
    title: 'ميزات للمعلم 🎓',
    icon: BookOpen,
    gradient: 'gradient-blue',
    features: [
      {
        title: 'مواد جاهزة حسب مناهج الوزارة لكل صف',
        description: 'محتوى تعليمي شامل ومنظم وفق المناهج الرسمية'
      },
      {
        title: 'محتوى تفاعلي مع عروض وفيديوهات وشروحات للمواضيع الصعبة',
        description: 'أدوات متنوعة لتبسيط المفاهيم المعقدة'
      },
      {
        title: 'بنك أسئلة متطور ومولد امتحانات جاهزة مع الحلول',
        description: 'توفير الوقت في إعداد الامتحانات والتقييمات'
      },
      {
        title: 'إمكانية إعداد أوراق عمل وامتحانات بضغطة زر',
        description: 'سهولة في التحضير والتخطيط للدروس'
      },
      {
        title: 'تقارير متابعة تفصيلية لكل طالب مع عرض الأسئلة غير المجاب عنها',
        description: 'متابعة دقيقة لتقدم الطلاب وتحديد نقاط الضعف'
      }
    ]
  },
  student: {
    title: 'ميزات للطالب 👩‍🎓',
    icon: GraduationCap,
    gradient: 'gradient-orange',
    features: [
      {
        title: 'وصول كامل للمحتوى من البيت أو المدرسة',
        description: 'تعلم مرن في أي وقت ومن أي مكان'
      },
      {
        title: 'ألعاب تعليمية محفزة ورسوم متحركة تزيد المشاركة',
        description: 'تعلم ممتع وتفاعلي يحفز على المشاركة'
      },
      {
        title: 'فيديوهات Packet Tracer لدعم المشاريع (عاشر وثاني عشر)',
        description: 'دعم عملي للمشاريع التطبيقية'
      },
      {
        title: 'حفظ المشروع داخل المنظومة لمنع ضياعه',
        description: 'أمان وحماية للأعمال والمشاريع'
      },
      {
        title: 'نظام تحفيزي ذكي يتطور مع تقدم الطالب',
        description: 'تحفيز مستمر ومكافآت تعليمية'
      },
      {
        title: 'متابعة واضحة لمسار مشروع التخرج خطوة بخطوة',
        description: 'إرشاد منظم لإنجاز المشروع النهائي'
      }
    ]
  },
  admin: {
    title: 'ميزات للإدارة 🏫',
    icon: School,
    gradient: 'gradient-blue',
    features: [
      {
        title: 'رفع نتائج التحصيل في امتحانات البجروت',
        description: 'تحسين مستوى الطلاب وزيادة معدلات النجاح'
      },
      {
        title: 'تقوية العلاقة مع الأهالي عبر رسائل واتساب بعد كل اختبار',
        description: 'تواصل فعال ومستمر مع أولياء الأمور'
      },
      {
        title: 'تقارير شاملة لمستوى كل صف ولوحة متابعة متكاملة',
        description: 'نظرة شاملة على الأداء العام للمدرسة'
      },
      {
        title: 'تقليل نسب "חשד" بتقليل الأخطاء والغش في مشاريع التخرج',
        description: 'فحص ذكي للمشاريع قبل التسليم لضمان الأصالة'
      }
    ]
  }
};

export const FeatureSection = ({ type }: FeatureSectionProps) => {
  const data = featureData[type];
  const IconComponent = data.icon;

  return (
    <Card className="modern-card h-full">
      <CardHeader className="text-center pb-6">
        <div className={`w-20 h-20 mx-auto mb-4 ${data.gradient} rounded-2xl flex items-center justify-center`}>
          <IconComponent className="h-10 w-10 text-white" />
        </div>
        <CardTitle className="text-2xl font-cairo text-gray-800">
          {data.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};