import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import './slider-animations.css';

const AdminFeaturesSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const slides = [
    {
      title: 'إدارة شاملة للصفوف',
      description: 'واجهة موحدة لإدارة جميع الصفوف والطلاب',
      image: '/admin-features/class-management.png',
      features: ['تنظيم الصفوف', 'إدارة الطلاب', 'متابعة فورية']
    },
    {
      title: 'وصول سريع للأدوات',
      description: 'لوحة تحكم ذكية للوصول السريع للوظائف',
      image: '/admin-features/quick-dashboard.png',
      features: ['أدوات متنوعة', 'أحداث قادمة', 'وصول مباشر']
    },
    {
      title: 'تقارير وإحصائيات تفصيلية',
      description: 'مؤشرات أداء شاملة ومتابعة مستمرة',
      image: '/admin-features/statistics-dashboard.png',
      features: ['إحصائيات فورية', 'تتبع التقدم', 'تقارير شاملة']
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-3xl"></div>
      
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-purple-100">
        <div className="relative h-96 px-16">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide 
                  ? 'opacity-100 scale-100 rotate-0' 
                  : index < currentSlide 
                    ? 'opacity-0 scale-95 -rotate-1' 
                    : 'opacity-0 scale-95 rotate-1'
              }`}
            >
              <div className="flex flex-col md:flex-row h-full px-4">
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative">
                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-purple-100 rounded-full opacity-30 animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-indigo-200 rounded-full opacity-20 animate-bounce"></div>
                  
                  <div className="relative z-10">
                    <div className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4 animate-fade-in">
                      للإدارة
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 animate-slide-up">
                      {slide.title}
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                      {slide.description}
                    </p>
                    <ul className="space-y-3">
                      {slide.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-700 animate-slide-right" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-full mr-4 flex-shrink-0 animate-pulse"></div>
                          <span className="text-base font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                  
                  <div className="relative z-10 group">
                     <div className="relative transform transition-all duration-500 group-hover:scale-105">
                       <img
                         src={slide.image}
                         alt={slide.title}
                         onClick={() => setEnlargedImage(slide.image)}
                         className="max-w-full max-h-[20rem] md:max-h-[24rem] lg:max-h-[28rem] w-auto h-auto rounded-2xl object-contain shadow-2xl border-4 border-white bg-white/10 cursor-pointer hover:shadow-3xl transition-shadow duration-300"
                       />
                        {/* Admin Elements - pointer-events-none to allow clicking through */}
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-purple-400 rounded-full animate-bounce pointer-events-none"></div>
                        <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-indigo-400 rounded-full animate-bounce pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                     
                     {/* Orbit Ring - pointer-events-none to allow clicking through */}
                     <div className="absolute inset-0 border-2 border-purple-200 rounded-full animate-spin-slow opacity-20 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-purple-50 text-purple-600 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-purple-100 z-20"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-purple-50 text-purple-600 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-purple-100 z-20"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Enhanced Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-6 h-2 bg-purple-500 rounded-full' 
                  : 'w-2 h-2 bg-purple-200 hover:bg-purple-300 rounded-full hover:scale-125'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Image Enlargement Dialog */}
      <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/90 border-none">
          <div className="relative">
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>
            {enlargedImage && (
              <img
                src={enlargedImage}
                alt="صورة مكبرة"
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeaturesSlider;