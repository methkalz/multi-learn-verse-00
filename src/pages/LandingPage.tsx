/**
 * Enhanced Landing Page Component
 * 
 * Comprehensive marketing page for the educational computing platform.
 * Features Arabic content with detailed sections for teachers, students, and administration.
 * 
 * New Features:
 * - Detailed feature sections for each user type
 * - Grade-specific content breakdown
 * - Image slider with dashboard screenshots  
 * - WhatsApp direct contact integration
 * - Special offers and trial information
 * - Enhanced responsive design
 * 
 * @author Educational Platform Team
 * @version 2.0.0
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Target, Zap, Trophy, Gamepad2, Play, Users, ArrowRight } from 'lucide-react';
import { ImageSlider } from '@/components/landing/ImageSlider';
import { WhatsAppButton } from '@/components/landing/WhatsAppButton';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { GradeContent } from '@/components/landing/GradeContent';
import { SpecialOffer } from '@/components/landing/SpecialOffer';

/**
 * LandingPage Component Implementation
 * 
 * Marketing-focused landing page for external visitors
 */
const LandingPage = () => {
  /**
   * Smooth Scroll Navigation Helper
   * 
   * Scrolls to specific sections on the page with offset compensation
   * for the fixed header. Provides smooth scrolling animation.
   * 
   * @param sectionId - The DOM ID of the target section
   */
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Fixed header height compensation
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white creative-background flex flex-col" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200/50 z-50">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/f942a38c-ddca-45fc-82fc-239e22268abe.png" alt="شعار الموقع" className="h-10 w-auto" />
              <span className="text-xl font-semibold font-cairo text-gray-600">التقنية ببساطة</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('materials')} className="text-gray-600 hover:text-primary transition-colors">
                المواد التعليمية
              </button>
              <button onClick={() => scrollToSection('benefits')} className="text-gray-600 hover:text-primary transition-colors">
                لماذا منصتنا؟
              </button>
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-primary transition-colors">
                ميزات تفاعلية
              </button>
              <Button onClick={() => scrollToSection('cta')} className="gradient-blue text-white hover:scale-105 transition-all duration-300">
                ابدأ الآن
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Floating Light Orbs */}
        <div className="light-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="orb orb-4"></div>
          <div className="orb orb-5"></div>
          <div className="orb orb-6"></div>
          <div className="orb orb-7"></div>
        </div>

        <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/40"></div>

          {/* Ambient Light Elements */}
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-full blur-3xl float-animation"></div>
          <div className="absolute bottom-32 left-16 w-32 h-32 bg-gradient-to-tr from-secondary/8 to-primary/3 rounded-full blur-2xl float-animation" style={{
          animationDelay: '2s'
        }}></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-bl from-primary/6 to-secondary/3 rounded-full blur-xl float-animation" style={{
          animationDelay: '4s'
        }}></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center fade-in-up -mt-[80px]">
              {/* Logo/Brand */}
              <div className="mb-8">
                <div className="flex items-center justify-center mb-6">
                  <img src="/lovable-uploads/f942a38c-ddca-45fc-82fc-239e22268abe.png" alt="شعار الموقع" className="h-20 md:h-24 w-auto" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold font-cairo mb-4">
                  
                  
                </h1>
                <div className="w-20 h-1 gradient-blue mx-auto rounded-full"></div>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-3xl md:text-4xl font-bold font-cairo text-gray-800 mb-6 leading-relaxed">
                نظام تعليمي وإداري ذكي لتخصص الحوسبة
              </h1>
              
              <h2 className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed max-w-4xl mx-auto">
                ارتقِ بمستوى طلابك ووفر وقتك مع منصة تعليمية وإدارية شاملة وذكية، 
                صُممت خصيصًا لدعم المدارس والمعلمين والطلاب والإدارة
              </h2>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-4xl mx-auto shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">منصة واحدة تقدم كل ما تحتاجه:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>مواد تعليمية جاهزة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>بنك امتحانات بجروت ومولد امتحانات فوري</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>ألعاب تعليمية محفزة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>تقارير تفصيلية وفورية</span>
                  </div>
                </div>
              </div>
              
              <p className="text-lg font-semibold text-primary mb-12">
                نلتزم بتحسين معدل نجاح الطلاب في امتحانات البجروت
              </p>
              
              {/* CTA Buttons */}
              <div className="flex gap-4 justify-center flex-wrap mb-16">
                <Button size="lg" className="gradient-blue hover:gradient-orange text-white hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-xl shadow-lg" onClick={() => window.open('/auth', '_blank')}>
                  تسجيل الدخول
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 text-lg px-8 py-4 rounded-xl" onClick={() => window.open('/auth', '_blank')}>
                  ابدأ الآن
                </Button>
              </div>

              {/* Key Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                {[{
                icon: CheckCircle,
                text: "مطابق لوزارة التربية",
                color: "text-green-600"
              }, {
                icon: CheckCircle,
                text: "تفاعلي ومرح",
                color: "text-blue-600"
              }, {
                icon: CheckCircle,
                text: "تقارير شاملة",
                color: "text-orange-600"
              }].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 justify-center">
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  <span className="text-gray-700 font-medium">{feature.text}</span>
                </div>
              ))}
              </div>
            </div>
          </div>
        </section>

        {/* Image Slider Section */}
        <section className="py-20 bg-muted/40 relative z-10 -mt-[120px]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-cairo text-gray-800 mb-4">
                استكشف واجهات النظام
              </h2>
              <div className="w-16 h-1 gradient-blue mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                تصفح لقطات حية من لوحات التحكم المختلفة للمعلمين والطلاب والإدارة
              </p>
            </div>
            <ImageSlider />
          </div>
        </section>

        {/* Grade Content Details */}
        <GradeContent />

        {/* Detailed Features Sections */}
        <section className="py-20 bg-muted/40">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-cairo text-gray-800 mb-4">
                ميزات شاملة لكل المستخدمين
              </h2>
              <div className="w-16 h-1 gradient-orange mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                نقدم حلول متخصصة ومصممة خصيصاً لتلبية احتياجات المعلمين والطلاب وإدارة المدارس
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <FeatureSection type="teacher" />
              <FeatureSection type="student" />
              <FeatureSection type="admin" />
            </div>
          </div>
        </section>

        {/* Key Benefits Section */}
        <section id="benefits" className="py-20 bg-white relative z-10">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-cairo text-gray-800 mb-4">
                لماذا نظامنا هو الأفضل؟
              </h2>
              <div className="w-16 h-1 gradient-orange mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                نقدم حلول مبتكرة ومجربة لرفع مستوى التعليم وتحسين نتائج الطلاب
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[{
                title: "نتائج مضمونة",
                icon: Target,
                description: "تحسين معدلات النجاح في البجروت",
                benefits: ["زيادة نسب النجاح بنسبة تصل إلى 30%", "تقليل معدل الرسوب", "تحسين جودة المشاريع", "رفع مستوى الفهم"],
                gradient: "gradient-blue"
              }, {
                title: "توفير الوقت والجهد",
                icon: Zap,
                description: "أتمتة المهام الإدارية والتعليمية",
                benefits: ["توفير 60% من وقت التحضير", "تصحيح تلقائي للامتحانات", "تقارير فورية", "إدارة مبسطة للمحتوى"],
                gradient: "gradient-orange"
              }, {
                title: "جودة عالمية",
                icon: Trophy,
                description: "معايير دولية في التعليم",
                benefits: ["مطابق للمعايير الدولية", "تحديث مستمر للمحتوى", "دعم فني متخصص", "ضمان الجودة"],
                gradient: "gradient-blue"
              }].map((benefit, index) => (
                <Card key={benefit.title} className="modern-card group text-center hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className={`w-20 h-20 mx-auto mb-4 ${benefit.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <benefit.icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-xl font-cairo text-gray-800 mb-2">{benefit.title}</CardTitle>
                    <p className="text-gray-600 font-medium">{benefit.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {benefit.benefits.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Features */}
        <section id="features" className="py-20 bg-muted/40 relative overflow-hidden z-10">
          {/* Floating Feature Icons */}
          <div className="feature-icons">
            <div className="feature-icon feature-icon-1">
              <Gamepad2 size={48} className="text-primary" />
            </div>
            <div className="feature-icon feature-icon-2">
              <Play size={56} className="text-primary" />
            </div>
            <div className="feature-icon feature-icon-3">
              <Users size={40} className="text-primary" />
            </div>
            <div className="feature-icon feature-icon-4">
              <CheckCircle size={52} className="text-primary" />
            </div>
            <div className="feature-icon feature-icon-5">
              <Gamepad2 size={44} className="text-primary" />
            </div>
            <div className="feature-icon feature-icon-6">
              <Play size={60} className="text-primary" />
            </div>
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16 relative z-20">
              <h2 className="text-4xl font-bold font-cairo text-gray-800 mb-4 text-center">ميزات تفاعلية</h2>
              <div className="w-16 h-1 gradient-blue mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto text-center">
                تقنيات حديثة تجعل التعليم أكثر متعة وفعالية
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto relative z-20">
              {[{
              title: "ألعاب تفاعلية",
              icon: Gamepad2,
              gradient: "gradient-blue"
            }, {
              title: "فيديوهات تعليمية",
              icon: Play,
              gradient: "gradient-orange"
            }, {
              title: "نظام أفاتار",
              icon: Users,
              gradient: "gradient-blue"
            }, {
              title: "تصحيح ذكي",
              icon: CheckCircle,
              gradient: "gradient-orange"
            }].map((feature, index) => (
              <Card key={feature.title} className="modern-card interactive-card text-center group hover:shadow-2xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className={`w-16 h-16 mx-auto mb-4 ${feature.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-lg">{feature.title}</h3>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        </section>

        {/* Special Offer */}
        <SpecialOffer />

        {/* Call to Action */}
        <section id="cta" className="py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold font-cairo text-gray-800 mb-6">
                ابدأ رحلتك التعليمية الآن
              </h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                انضم إلى آلاف المعلمين والطلاب الذين يستخدمون منصتنا لتحقيق نتائج استثنائية
              </p>
              <div className="flex gap-6 justify-center flex-wrap">
                <Button size="lg" className="gradient-blue hover:gradient-orange text-white hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-xl shadow-lg" onClick={() => window.open('/auth', '_blank')}>
                  ابدأ الآن مجاناً
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Button>
                <WhatsAppButton />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/lovable-uploads/f942a38c-ddca-45fc-82fc-239e22268abe.png" alt="شعار الموقع" className="h-8 w-auto" />
                <span className="text-lg font-semibold">التقنية ببساطة</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                منصة تعليمية شاملة لتخصص الحوسبة تهدف لرفع مستوى التعليم وتحسين نتائج الطلاب
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('benefits')} className="hover:text-white transition-colors">المزايا</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">الميزات</button></li>
                <li><button onClick={() => window.open('/auth', '_blank')} className="hover:text-white transition-colors">تسجيل الدخول</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">تواصل معنا</h3>
              <div className="space-y-2 text-gray-400">
                <p>يونس عمارنة</p>
                <p>0528359103</p>
                <WhatsAppButton variant="footer" />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 التقنية ببساطة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;