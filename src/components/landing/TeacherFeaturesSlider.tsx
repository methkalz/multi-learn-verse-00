import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './slider-animations.css';

const TeacherFeaturesSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'مواد جاهزة حسب مناهج الوزارة',
      description: 'محتوى شامل لكل صف مطابق للمناهج الرسمية',
      image: '/avatars/teacher-female-1.png',
      features: ['محتوى مطابق للمناهج', 'تحديث مستمر', 'جودة عالية']
    },
    {
      title: 'بنك أسئلة متطور',
      description: 'مولد امتحانات جاهزة مع الحلول الكاملة',
      image: '/avatars/teacher-male-1.png',
      features: ['آلاف الأسئلة', 'حلول مفصلة', 'تصنيف حسب الصعوبة']
    },
    {
      title: 'تقارير متابعة تفصيلية',
      description: 'متابعة كل طالب مع عرض الأسئلة غير المجاب عنها',
      image: '/avatars/teacher-female-2.png',
      features: ['تحليل الأداء', 'تقارير فورية', 'متابعة فردية']
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl"></div>
      
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-blue-100">
        <div className="relative h-96 px-16"> {/* Added padding to avoid arrow overlap */}
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide 
                  ? 'opacity-100 translate-x-0 scale-100' 
                  : index < currentSlide 
                    ? 'opacity-0 -translate-x-full scale-95' 
                    : 'opacity-0 translate-x-full scale-95'
              }`}
            >
              <div className="flex flex-col md:flex-row h-full px-4">
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative">
                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-16 h-16 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-blue-200 rounded-full opacity-20 animate-bounce"></div>
                  
                  <div className="relative z-10">
                    <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4 animate-fade-in">
                      للمعلم
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
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full ml-2 flex-shrink-0 animate-pulse"></div>
                          <span className="text-base font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100"></div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-float"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
                  
                  <div className="relative z-10 group">
                    <div className="relative transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover shadow-2xl border-4 border-white"
                      />
                      {/* Floating Dots */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="absolute -bottom-3 -left-3 w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    
                    {/* Orbit Ring */}
                    <div className="absolute inset-0 border-2 border-blue-200 rounded-full animate-spin-slow opacity-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation - Positioned outside content area */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-blue-50 text-blue-600 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-blue-100 z-20"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-blue-50 text-blue-600 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-blue-100 z-20"
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
                  ? 'w-6 h-2 bg-blue-500 rounded-full' 
                  : 'w-2 h-2 bg-blue-200 hover:bg-blue-300 rounded-full hover:scale-125'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherFeaturesSlider;