/**
 * Grade Content Component
 * Detailed information about each grade level
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Network, Award, CheckCircle } from 'lucide-react';

interface GradeDetails {
  title: string;
  icon: React.ElementType;
  description: string;
  details: string[];
  highlights: string[];
  gradient: string;
}

const gradeData: GradeDetails[] = [
  {
    title: 'الصف العاشر',
    icon: Monitor,
    description: 'أساسيات الحوسبة والشبكات',
    details: [
      'التعرف على نظام التشغيل ويندوز',
      'مقدمة شاملة في عالم الشبكات',
      'مشاريع مصغرة تطبيقية'
    ],
    highlights: [
      'فيديوهات تعليمية متخصصة',
      'تطبيقات عملية على ويندوز',
      'مقدمة عملية للشبكات'
    ],
    gradient: 'gradient-blue'
  },
  {
    title: 'الصف الحادي عشر',
    icon: Network,
    description: 'التحضير لامتحان البجروت',
    details: [
      'المادة المطلوبة (70%) لامتحان البجروت',
      'تحضير شامل ومنهجي للامتحانات النهائية',
      'تدريبات مكثفة على نماذج الامتحانات'
    ],
    highlights: [
      'بنك أسئلة شامل للبجروت',
      'امتحانات تجريبية',
      'مراجعات مكثفة'
    ],
    gradient: 'gradient-orange'
  },
  {
    title: 'الصف الثاني عشر',
    icon: Award,
    description: 'مشروع التخرج والتطبيق العملي',
    details: [
      'مهام قصيرة وفيديوهات عملية لتنفيذ مشروع التخرج',
      'فحص نسبة التشابه بين المشاريع',
      'إرشاد خطوة بخطوة لإنجاز المشروع'
    ],
    highlights: [
      'فيديوهات Packet Tracer',
      'نظام مكافحة الانتحال',
      'متابعة فردية للمشاريع'
    ],
    gradient: 'gradient-blue'
  }
];

export const GradeContent = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-cairo text-gray-800 mb-4">
            محتوى الصفوف التفصيلي
          </h2>
          <div className="w-16 h-1 gradient-blue mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            منهج متدرج ومتكامل يغطي جميع متطلبات تخصص الحوسبة من الأساسيات إلى المشروع النهائي
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {gradeData.map((grade, index) => {
            const IconComponent = grade.icon;
            
            return (
              <Card key={grade.title} className="modern-card group hover:shadow-2xl transition-all duration-300">
                <CardHeader className="text-center pb-6">
                  <div className={`w-20 h-20 mx-auto mb-4 ${grade.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-cairo text-gray-800 mb-2">
                    {grade.title}
                  </CardTitle>
                  <p className="text-gray-600 font-medium">{grade.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Main Details */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">المحتوى الأساسي:</h4>
                    <ul className="space-y-2">
                      {grade.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Highlights */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">الميزات الخاصة:</h4>
                    <ul className="space-y-2">
                      {grade.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};