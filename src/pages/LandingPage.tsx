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
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50 shadow-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/f942a38c-ddca-45fc-82fc-239e22268abe.png" alt="شعار المنصة" className="h-12 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">منصة التقنية ببساطة</h1>
                <p className="text-xs text-gray-500">نظام تعليمي شامل لتخصص الحوسبة</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-primary transition-colors font-medium">
                الميزات
              </button>
              <button onClick={() => scrollToSection('content')} className="text-gray-600 hover:text-primary transition-colors font-medium">
                المحتوى
              </button>
              <button onClick={() => scrollToSection('offers')} className="text-gray-600 hover:text-primary transition-colors font-medium">
                العروض
              </button>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-lg">
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
        <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* عناصر خلفية متحركة */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-32 left-16 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-bl from-primary/10 to-secondary/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* الشعار والعنوان */}
              <div className="mb-12">
                <img src="/lovable-uploads/f942a38c-ddca-45fc-82fc-239e22268abe.png" alt="شعار المنصة" className="h-24 md:h-32 w-auto mx-auto mb-8" />
                <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
                  التقنية ببساطة
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mb-8"></div>
              </div>
              
              {/* العنوان المتحرك */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-4xl font-semibold text-gray-700 mb-6 leading-relaxed min-h-[3rem] md:min-h-[4rem]">
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
              
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                منصة تعليمية متكاملة تشمل مواد دراسية، امتحانات تفاعلية، متابعة دقيقة، وتغذية راجعة فورية
                <br />
                <span className="text-primary font-bold text-2xl">🎯 مطابقة 100% لتعليمات وزارة التربية والتعليم</span>
              </p>
              
              {/* أزرار العمل */}
              <div className="flex gap-6 justify-center flex-wrap mb-16">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white text-xl px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  ابدأ التجربة المجانية
                  <ArrowRight className="mr-3 h-6 w-6" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => scrollToSection('content')}
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white text-xl px-10 py-6 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  استكشف المحتوى
                  <Play className="mr-3 h-6 w-6" />
                </Button>
              </div>

              {/* الإحصائيات */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {[
                  { number: '1000+', label: 'طالب نشط', icon: Users },
                  { number: '50+', label: 'معلم متميز', icon: BookOpen },
                  { number: '25+', label: 'مدرسة شريكة', icon: Monitor },
                  { number: '98%', label: 'نسبة الرضا', icon: Star }
                ].map((stat, index) => (
                  <div key={index} className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-800 mb-1">{stat.number}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ميزات المنصة */}
        <section id="features">
          <FeatureSection />
        </section>

        {/* المحتوى التعليمي */}
        <section id="content">
          <GradeContent />
        </section>

        {/* الميزات التفاعلية */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                ميزات تفاعلية متقدمة
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                تقنيات حديثة ومبتكرة تجعل التعليم أكثر متعة وفعالية
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: 'ألعاب تفاعلية',
                  description: 'ألعاب تعليمية ممتعة تعزز التعلم',
                  icon: Gamepad2,
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  title: 'فيديوهات تعليمية',
                  description: 'شروحات مصورة عالية الجودة',
                  icon: Play,
                  color: 'from-green-500 to-green-600'
                },
                {
                  title: 'نظام أفاتار',
                  description: 'تخصيص الشخصية والتفاعل',
                  icon: Users,
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  title: 'تصحيح ذكي',
                  description: 'تقييم فوري ودقيق للإجابات',
                  icon: CheckCircle,
                  color: 'from-orange-500 to-orange-600'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* العروض الخاصة */}
        <section id="offers">
          <SpecialOffer />
        </section>

        {/* Call to Action نهائي */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white" dir="rtl">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              هل أنت مستعد لتجربة التعليم المستقبلي؟
            </h2>
            <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
              انضم إلى آلاف المعلمين والطلاب الذين يستخدمون منصتنا لتحقيق النجاح الأكاديمي
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-white text-primary hover:bg-gray-100 text-xl px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-bold"
              >
                ابدأ الآن مجاناً
                <ArrowRight className="mr-3 h-6 w-6" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" dir="rtl">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/lovable-uploads/f942a38c-ddca-45fc-82fc-239e22268abe.png" alt="الشعار" className="h-10 w-auto" />
                <span className="text-xl font-bold">التقنية ببساطة</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                منصة تعليمية شاملة لتخصص الحوسبة والشبكات
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">الصفحة الرئيسية</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">الميزات</a></li>
                <li><a href="#content" className="hover:text-white transition-colors">المحتوى</a></li>
                <li><a href="#offers" className="hover:text-white transition-colors">العروض</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">الدعم</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">تواصل معنا</h3>
              <div className="space-y-2 text-gray-400">
                <p>📧 info@tech-simple.com</p>
                <p>📱 +972-XX-XXX-XXXX</p>
                <p>📍 فلسطين</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 منصة التقنية ببساطة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;