import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle, Star, Gamepad2, Users, Monitor, BookOpen } from 'lucide-react';
import TypewriterEffect from '@/components/TypewriterEffect';
import FeatureSection from '@/components/landing/FeatureSection';
import GradeContent from '@/components/landing/GradeContent';
import SpecialOffer from '@/components/landing/SpecialOffer';
import WhatsAppButton from '@/components/landing/WhatsAppButton';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/f942a38c-ddca-45fc-82fc-239e22268abe.png" alt="شعار المنصة" className="h-10 w-auto" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">التقنية ببساطة</h1>
                <p className="text-xs text-gray-500">نظام تعليمي لتخصص الحوسبة</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                الميزات
              </button>
              <button onClick={() => scrollToSection('content')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                المحتوى
              </button>
              <Button onClick={() => navigate('/auth')} className="bg-gray-900 text-white hover:bg-gray-800 text-sm px-6 py-2 rounded-md transition-colors">
                ابدأ الآن
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* واتساب */}
      <WhatsAppButton />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center pt-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              {/* الشعار والعنوان */}
              <div className="mb-16">
                <img src="/lovable-uploads/f942a38c-ddca-45fc-82fc-239e22268abe.png" alt="شعار المنصة" className="h-20 w-auto mx-auto mb-12" />
                <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-8 tracking-tight">
                  التقنية ببساطة
                </h1>
                <div className="w-16 h-px bg-gray-300 mx-auto mb-12"></div>
              </div>
              
              {/* العنوان المتحرك */}
              <div className="mb-16">
                <h2 className="text-xl md:text-2xl font-normal text-gray-700 mb-8 leading-relaxed min-h-[2rem] md:min-h-[3rem]">
                  <TypewriterEffect 
                    texts={[
                      "نظام تعليمي وإداري شامل لتخصص الحوسبة والشبكات",
                      "نتعلّم ونكتشف المزيد من التقنيات بكل شغف وإبداع", 
                      "نحصل على أفضل تجربة تعليمية وأعلى النتائج الأكاديمية"
                    ]} 
                    typeSpeed={60} 
                    deleteSpeed={30} 
                    pauseDuration={3500} 
                  />
                </h2>
              </div>
              
              <p className="text-base md:text-lg text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed">
                منصة تعليمية متكاملة تشمل مواد دراسية، امتحانات تفاعلية، متابعة دقيقة، وتغذية راجعة فورية
              </p>
              
              {/* أزرار العمل */}
              <div className="flex gap-4 justify-center flex-wrap mb-20">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-md transition-colors font-medium"
                >
                  ابدأ التجربة المجانية
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => scrollToSection('content')}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-md transition-colors font-medium"
                >
                  استكشف المحتوى
                </Button>
              </div>

              {/* الإحصائيات */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                {[
                  { number: '1000+', label: 'طالب نشط' },
                  { number: '50+', label: 'معلم متميز' },
                  { number: '25+', label: 'مدرسة شريكة' },
                  { number: '98%', label: 'نسبة الرضا' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-light text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ميزات المنصة */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                ميزات المنصة
              </h2>
              <div className="w-12 h-px bg-gray-300 mx-auto mb-8"></div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                تقنيات حديثة ومبتكرة تجعل التعليم أكثر متعة وفعالية
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-5xl mx-auto">
              {[
                {
                  title: 'ألعاب تفاعلية',
                  description: 'ألعاب تعليمية ممتعة تعزز التعلم',
                  icon: Gamepad2
                },
                {
                  title: 'فيديوهات تعليمية',
                  description: 'شروحات مصورة عالية الجودة',
                  icon: Play
                },
                {
                  title: 'نظام أفاتار',
                  description: 'تخصيص الشخصية والمكافآت',
                  icon: Users
                },
                {
                  title: 'تصحيح ذكي',
                  description: 'تقييم فوري ودقيق للإجابات',
                  icon: CheckCircle
                }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <feature.icon className="h-8 w-8 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* المحتوى التعليمي */}
        <section id="content" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                المحتوى التعليمي
              </h2>
              <div className="w-12 h-px bg-gray-300 mx-auto mb-8"></div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                محتوى شامل لجميع صفوف تخصص الحوسبة والشبكات
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { grade: 'الصف العاشر', description: 'أساسيات البرمجة والحاسوب', subjects: '6 مواد' },
                { grade: 'الصف الحادي عشر', description: 'تطوير المهارات التقنية', subjects: '8 مواد' },
                { grade: 'الصف الثاني عشر', description: 'مشاريع متقدمة وتطبيقية', subjects: '10 مواد' }
              ].map((item, index) => (
                <div key={index} className="text-center p-8 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <h3 className="text-xl font-medium text-gray-900 mb-3">{item.grade}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{item.subjects}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action نهائي */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-light mb-8">
              ابدأ رحلتك التعليمية اليوم
            </h2>
            <p className="text-lg mb-12 max-w-2xl mx-auto text-gray-300">
              انضم إلى آلاف المعلمين والطلاب الذين يستخدمون منصتنا
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-md transition-colors font-medium"
            >
              ابدأ الآن مجاناً
              <ArrowRight className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <img src="/lovable-uploads/f942a38c-ddca-45fc-82fc-239e22268abe.png" alt="الشعار" className="h-8 w-auto" />
                <span className="text-lg font-medium text-gray-900">التقنية ببساطة</span>
              </div>
              <p className="text-gray-600 text-sm">
                منصة تعليمية شاملة لتخصص الحوسبة والشبكات
              </p>
            </div>
            <div className="text-center md:text-right">
              <h3 className="font-medium mb-4 text-gray-900">روابط سريعة</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-gray-900 transition-colors">الصفحة الرئيسية</a></li>
                <li><a href="#features" className="hover:text-gray-900 transition-colors">الميزات</a></li>
                <li><a href="#content" className="hover:text-gray-900 transition-colors">المحتوى</a></li>
              </ul>
            </div>
            <div className="text-center md:text-right">
              <h3 className="font-medium mb-4 text-gray-900">الدعم</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-gray-900 transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">اتصل بنا</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">الأسئلة الشائعة</a></li>
              </ul>
            </div>
            <div className="text-center md:text-right">
              <h3 className="font-medium mb-4 text-gray-900">تواصل معنا</h3>
              <div className="space-y-2 text-gray-600 text-sm">
                <p>info@tech-simple.com</p>
                <p>+972-052-835-9103</p>
                <p>فلسطين</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 منصة التقنية ببساطة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;