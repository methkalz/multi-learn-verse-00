import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle, Star, Gamepad2, Users, Monitor, BookOpen } from 'lucide-react';
import TypewriterEffect from '@/components/TypewriterEffect';
import WhatsAppButton from '@/components/landing/WhatsAppButton';
import DashboardImageSlider from '@/components/landing/DashboardImageSlider';

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
                <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight">
                  نظام تعليمي وإداري ذكي لتخصص الحوسبة
                </h1>
                <div className="w-16 h-px bg-gray-300 mx-auto mb-12"></div>
              </div>
              
              {/* العنوان المتحرك */}
              <div className="mb-16">
                <h2 className="text-xl md:text-2xl font-normal text-gray-700 mb-8 leading-relaxed">
                  <TypewriterEffect 
                    texts={[
                      "ارتقِ بمستوى طلابك ووفر وقتك مع منصة تعليمية وإدارية شاملة وذكية",
                      "صُممت خصيصًا لدعم المدارس والمعلمين والطلاب والإدارة", 
                      "نلتزم بتحسين معدل نجاح الطلاب في امتحانات البجروت"
                    ]} 
                    typeSpeed={60} 
                    deleteSpeed={30} 
                    pauseDuration={3500} 
                  />
                </h2>
              </div>
              
              <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
                منصة واحدة تقدم كل ما تحتاجه
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16 text-sm md:text-base">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="text-gray-700">📚 مواد تعليمية جاهزة</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="text-gray-700">📝 بنك امتحانات بجروت</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="text-gray-700">🎮 ألعاب تعليمية محفزة</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <span className="text-gray-700">📊 تقارير تفصيلية فورية</span>
                </div>
              </div>
              
              {/* أزرار العمل */}
              <div className="flex gap-4 justify-center flex-wrap mb-20">
                <Button 
                  size="lg" 
                  onClick={() => window.open('https://wa.me/972528359103?text=مرحبا.. معني بالحصول على تفاصيل أكثر عن النظام المميز', '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md transition-colors font-medium"
                >
                  اطلب الآن
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => scrollToSection('features')}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-md transition-colors font-medium"
                >
                  تعرف على الميزات
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

        {/* عرض اللوحات */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                لوحات تحكم مخصصة لكل مستخدم
              </h2>
              <div className="w-12 h-px bg-gray-300 mx-auto mb-8"></div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                كل مستخدم له لوحة تحكم مصممة خصيصاً لاحتياجاته
              </p>
            </div>
            <DashboardImageSlider />
          </div>
        </section>

        {/* ميزات للمعلم */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                ميزات للمعلم
              </h2>
              <div className="w-12 h-px bg-gray-300 mx-auto mb-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: 'مواد جاهزة حسب مناهج الوزارة',
                  description: 'محتوى شامل لكل صف مطابق للمناهج الرسمية',
                  icon: BookOpen
                },
                {
                  title: 'محتوى تفاعلي',
                  description: 'عروض وفيديوهات وشروحات للمواضيع الصعبة',
                  icon: Play
                },
                {
                  title: 'بنك أسئلة متطور',
                  description: 'مولد امتحانات جاهزة مع الحلول',
                  icon: CheckCircle
                },
                {
                  title: 'أوراق عمل بضغطة زر',
                  description: 'إعداد امتحانات وأوراق عمل فوري',
                  icon: Gamepad2
                },
                {
                  title: 'تقارير متابعة تفصيلية',
                  description: 'متابعة كل طالب مع عرض الأسئلة غير المجاب عنها',
                  icon: Users
                },
                {
                  title: 'دعم المشاريع',
                  description: 'مساعدة في تنفيذ مشاريع الطلاب وفحص التشابه',
                  icon: Monitor
                }
              ].map((feature, index) => (
                <div key={index} className="text-center group p-6 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
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
        <section id="content" className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                المحتوى حسب الصفوف
              </h2>
              <div className="w-12 h-px bg-gray-300 mx-auto mb-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { 
                  grade: 'الصف العاشر', 
                  description: 'التعرف على نظام ويندوز، مقدمة في الشبكات، ومشاريع مصغرة مع فيديوهات',
                  features: ['نظام ويندوز', 'مقدمة الشبكات', 'مشاريع مصغرة', 'فيديوهات تعليمية']
                },
                { 
                  grade: 'الصف الحادي عشر', 
                  description: 'المادة المطلوبة (70%) لامتحان البجروت',
                  features: ['منهج البجروت', '70% من المطلوب', 'تحضير شامل', 'امتحانات تجريبية']
                },
                { 
                  grade: 'الصف الثاني عشر', 
                  description: 'مهام قصيرة وفيديوهات عملية لتنفيذ مشروع التخرج، مع فحص نسبة التشابه',
                  features: ['مشروع التخرج', 'فيديوهات عملية', 'فحص التشابه', 'متابعة مستمرة']
                }
              ].map((item, index) => (
                <div key={index} className="bg-white p-8 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <h3 className="text-xl font-medium text-gray-900 mb-4">{item.grade}</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">{item.description}</p>
                  <ul className="space-y-2">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700 text-sm">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ميزات للطالب والإدارة */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
              
              {/* ميزات للطالب */}
              <div>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-8">ميزات للطالب</h2>
                <div className="space-y-6">
                  {[
                    'وصول كامل للمحتوى من البيت أو المدرسة',
                    'ألعاب تعليمية محفزة ورسوم متحركة تزيد المشاركة',
                    'فيديوهات Packet Tracer لدعم المشاريع (عاشر وثاني عشر)',
                    'حفظ المشروع داخل المنظومة لمنع ضياعه',
                    'نظام تحفيزي ذكي يتطور مع تقدم الطالب',
                    'متابعة واضحة لمسار مشروع التخرج خطوة بخطوة'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                      <p className="text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ميزات للإدارة */}
              <div>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-8">ميزات للإدارة</h2>
                <div className="space-y-6">
                  {[
                    'رفع نتائج التحصيل في امتحانات البجروت',
                    'تقوية العلاقة مع الأهالي عبر رسائل واتساب بعد كل اختبار',
                    'تقارير شاملة لمستوى كل صف ولوحة متابعة متكاملة',
                    'تقليل نسب "חשד" بتقليل الأخطاء والغش في مشاريع التخرج',
                    'فحص ذكي للمشاريع قبل التسليم'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                      <p className="text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

        {/* عرض خاص للمدارس */}
        <section className="py-24 bg-blue-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-8">
              عرض خاص للمدارس
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-8 rounded-lg shadow-sm">
                  <h3 className="text-xl font-medium text-gray-900 mb-4">🎁 تجربة مجانية</h3>
                  <p className="text-gray-600">تجربة مجانية لمدة أسبوعين كاملين</p>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-sm">
                  <h3 className="text-xl font-medium text-gray-900 mb-4">💰 دعم גפ"ן</h3>
                  <p className="text-gray-600">فرصة الحصول على النظام مع دعم منظومة גפ"ן</p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
                <h3 className="text-xl font-medium text-gray-900 mb-4">📞 للتواصل والاستفسار</h3>
                <p className="text-lg text-gray-700 mb-6">يونس عمارنة: 0528359103</p>
                <Button 
                  size="lg" 
                  onClick={() => window.open('https://wa.me/972528359103?text=مرحبا.. معني بالحصول على تفاصيل أكثر عن النظام المميز', '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-md transition-colors font-medium text-lg"
                >
                  اطلب الآن
                  <ArrowRight className="mr-3 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
};

export default LandingPage;