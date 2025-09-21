import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './slider-animations.css';

const StudentFeaturesSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'ألعاب تعليمية محفزة',
      description: 'ألعاب ورسوم متحركة تزيد المشاركة والحماس',
      image: '/avatars/student-boy-1.png',
      features: ['تعلم ممتع', 'تحدي وإثارة', 'مكافآت وإنجازات']
    },
    {
      title: 'فيديوهات Packet Tracer',
      description: 'دعم المشاريع للصف العاشر والثاني عشر',
      image: '/avatars/student-girl-1.png',
      features: ['شروحات عملية', 'أمثلة تطبيقية', 'خطوة بخطوة']
    },
    {
      title: 'نظام تحفيزي ذكي',
      description: 'يتطور مع تقدم الطالب ويحفز على الإنجاز',
      image: '/avatars/student-boy-2.png',
      features: ['مستويات متقدمة', 'شارات الإنجاز', 'تحفيز مستمر']
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
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl"></div>
      
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-green-100">
        <div className="relative h-96">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : index < currentSlide 
                    ? 'opacity-0 -translate-y-full scale-95' 
                    : 'opacity-0 translate-y-full scale-95'
              }`}
            >
              <div className="flex flex-col md:flex-row h-full">
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative">
                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-20 h-20 bg-green-100 rounded-full opacity-50 animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-14 h-14 bg-emerald-200 rounded-full opacity-30 animate-bounce"></div>
                  
                  <div className="relative z-10">
                    <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4 animate-fade-in">
                      للطالب
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 animate-slide-up">
                      {slide.title}
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                      {slide.description}
                    </p>
                    <ul className="space-y-3">
                      {slide.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-700 animate-slide-left" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full mr-4 flex-shrink-0 animate-pulse"></div>
                          <span className="text-base font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-8 md:p-12 relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100"></div>
                  <div className="absolute top-0 left-0 w-28 h-28 bg-green-200 rounded-full opacity-20 transform animate-float"></div>
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-emerald-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
                  
                  <div className="relative z-10 group">
                    <div className="relative transform transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover shadow-2xl border-4 border-white"
                      />
                      {/* Gaming Elements */}
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center text-xs">⭐</div>
                      <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}>🎮</div>
                      <div className="absolute top-1/3 -right-5 w-3 h-3 bg-emerald-300 rounded-full animate-ping"></div>
                    </div>
                    
                    {/* Orbit Ring */}
                    <div className="absolute inset-0 border-2 border-green-200 rounded-full animate-spin-slow opacity-30"></div>
                    <div className="absolute inset-4 border border-emerald-100 rounded-full animate-reverse-spin opacity-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white hover:bg-green-50 text-green-600 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl border border-green-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white hover:bg-green-50 text-green-600 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl border border-green-100"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Enhanced Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`relative transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 h-3 bg-green-500 rounded-full' 
                  : 'w-3 h-3 bg-green-200 hover:bg-green-300 rounded-full hover:scale-125'
              }`}
            >
              {index === currentSlide && (
                <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 w-full bg-green-100 rounded-full h-1">
        <div 
          className="bg-gradient-to-r from-green-400 to-emerald-600 h-1 rounded-full transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StudentFeaturesSlider;