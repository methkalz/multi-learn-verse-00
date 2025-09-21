/**
 * Special Offer Section Component
 * Displays trial offer and contact information
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Calendar, Phone, Heart } from 'lucide-react';
import { WhatsAppButton } from './WhatsAppButton';

export const SpecialOffer = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-primary/3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-cairo text-gray-800 mb-4">
            عرض خاص للمدارس 🎁
          </h2>
          <div className="w-16 h-1 gradient-orange mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            فرصة ذهبية لتجربة النظام المتطور بدون أي التزامات مالية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Free Trial Card */}
          <Card className="modern-card group text-center hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="w-20 h-20 mx-auto mb-4 gradient-blue rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-cairo text-gray-800">
                تجربة مجانية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-6xl font-bold gradient-text mb-2">14</div>
                <p className="text-lg font-semibold text-gray-700">يوم مجاناً</p>
                <p className="text-gray-600">
                  جرب جميع ميزات النظام بدون أي قيود أو التزامات مالية
                </p>
                <ul className="text-sm text-gray-600 space-y-2 mt-4">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    وصول كامل لجميع الميزات
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    دعم فني مجاني
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    لا يوجد رسوم خفية
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="modern-card group text-center hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="w-20 h-20 mx-auto mb-4 gradient-orange rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-cairo text-gray-800">
                دعم منظومة גפ"ן
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-lg font-semibold text-gray-700">إمكانية الحصول على الدعم</p>
                <p className="text-gray-600">
                  فرصة للاستفادة من برامج الدعم الحكومية لتطوير التعليم
                </p>
                <ul className="text-sm text-gray-600 space-y-2 mt-4">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    دعم مالي للمدارس المؤهلة
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    برامج تدريب المعلمين
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    متابعة تطبيق النظام
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="modern-card max-w-2xl mx-auto text-center">
          <CardHeader className="pb-6">
            <div className="w-16 h-16 mx-auto mb-4 gradient-blue rounded-2xl flex items-center justify-center">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-cairo text-gray-800">
              للتواصل والاستفسار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-lg font-semibold text-gray-800 mb-2">يونس عمارنة</p>
                <p className="text-xl font-bold text-primary direction-ltr">0528359103</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <WhatsAppButton 
                  phoneNumber="0528359103"
                  message="مرحبا.. معني بالحصول على تفاصيل أكثر عن النظام المميز"
                  size="lg"
                />
              </div>
              
              <p className="text-sm text-gray-600 mt-4">
                نحن ملتزمون بتحسين معدل نجاح الطلاب في امتحانات البجروت
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};