import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import './slider-animations.css';

const StudentFeaturesSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [enlargedImageIndex, setEnlargedImageIndex] = useState<number | null>(null);

  const slides = [
    {
      title: 'وصول كامل للمحتوى',
      description: 'وصول كامل للمحتوى من البيت أو المدرسة.',
      image: '/student-features/student-projects.png',
      features: ['وصول من أي مكان', 'متوفر 24/7', 'سهولة الاستخدام']
    },
    {
      title: 'ألعاب تعليمية محفزة',
      description: 'ألعاب تعليمية محفزة ورسوم متحركة تزيد المشاركة.',
      image: '/student-features/student-progress.png',
      features: ['ألعاب تعليمية', 'رسوم متحركة', 'تفاعل ومتعة']
    },
    {
      title: 'فيديوهات Packet Tracer',
      description: 'فيديوهات Packet Tracer لدعم المشاريع (عاشر وثاني عشر).',
      image: '/student-features/student-dashboard.png',
      features: ['دعم المشاريع', 'شروحات عملية', 'تطبيق الشبكات']
    },
    {
      title: 'حفظ المشروع الآمن',
      description: 'حفظ المشروع داخل المنظومة لمنع ضياعه.',
      image: '/student-features/networking-labs.png',
      features: ['حفظ آمن', 'نسخ احتياطية', 'عدم ضياع البيانات']
    },
    {
      title: 'نظام تحفيزي ذكي',
      description: 'نظام تحفيزي ذكي يتطور مع تقدم الطالب.',
      image: '/student-features/content-management.png',
      features: ['تحفيز ذكي', 'تطور تدريجي', 'مكافآت وإنجازات']
    },
    {
      title: 'متابعة مشروع التخرج',
      description: 'متابعة واضحة لمسار مشروع التخرج خطوة بخطوة.',
      image: '/student-features/grade-overview.png',
      features: ['متابعة شاملة', 'خطوات واضحة', 'إرشاد مستمر']
    },
    {
      title: 'وصول كامل للمحتوى',
      description: 'وصول كامل للمحتوى من البيت أو المدرسة.',
      image: '/student-features/achievement-page.png',
      features: ['وصول من أي مكان', 'متوفر 24/7', 'سهولة الاستخدام']
    },
    {
      title: 'ألعاب تعليمية محفزة',
      description: 'ألعاب تعليمية محفزة ورسوم متحركة تزيد المشاركة.',
      image: '/student-features/learning-definitions.png',
      features: ['ألعاب تعليمية', 'رسوم متحركة', 'تفاعل ومتعة']
    },
    {
      title: 'فيديوهات Packet Tracer',
      description: 'فيديوهات Packet Tracer لدعم المشاريع (عاشر وثاني عشر).',
      image: '/student-features/word-matching-games.png',
      features: ['دعم المشاريع', 'شروحات عملية', 'تطبيق الشبكات']
    },
    {
      title: 'حفظ المشروع الآمن',
      description: 'حفظ المشروع داخل المنظومة لمنع ضياعه.',
      image: '/student-features/document-editor.png',
      features: ['حفظ آمن', 'نسخ احتياطية', 'عدم ضياع البيانات']
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

  const nextEnlargedImage = () => {
    if (enlargedImageIndex !== null) {
      setEnlargedImageIndex((prev) => prev === null ? 0 : (prev + 1) % slides.length);
    }
  };

  const prevEnlargedImage = () => {
    if (enlargedImageIndex !== null) {
      setEnlargedImageIndex((prev) => prev === null ? 0 : (prev - 1 + slides.length) % slides.length);
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto px-2 sm:px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl sm:rounded-3xl"></div>
      
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-green-100">
        <div className="relative h-[24rem] sm:h-80 md:h-96 px-2 sm:px-8 md:px-16">
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
              {/* Mobile Layout */}
              <div className="flex flex-col h-full px-1 sm:px-2 md:hidden">
                <div className="flex-1 p-2 sm:p-4 flex flex-col justify-center relative">
                  {/* Decorative Elements */}
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 bg-green-100 rounded-full opacity-30 animate-pulse"></div>
                  <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-6 h-6 bg-emerald-200 rounded-full opacity-20 animate-bounce"></div>
                  
                  <div className="relative z-10">
                    <div className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-2 animate-fade-in">
                      للطالب
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 animate-slide-up leading-tight">
                      {slide.title}
                    </h3>
                    <p className="text-gray-600 mb-3 text-sm leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                      {slide.description}
                    </p>
                    <ul className="space-y-1">
                      {slide.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-700 animate-slide-right" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                          <div className="w-1 h-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full ml-1 flex-shrink-0 animate-pulse"></div>
                          <span className="text-sm font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex-shrink-0 flex items-center justify-center p-2 relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100"></div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-emerald-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                  
                  <div className="relative z-10 group w-full max-w-[200px]">
                     <div className="relative transform transition-all duration-500 group-hover:scale-105">
                       <img
                         src={slide.image}
                         alt={slide.title}
                         onClick={() => setEnlargedImageIndex(index)}
                         className="w-full max-h-[8rem] object-contain rounded-lg shadow-xl border border-white bg-white/10 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                       />
                        {/* Student Elements - pointer-events-none to allow clicking through */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-bounce pointer-events-none"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-400 rounded-full animate-bounce pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                     
                     {/* Orbit Ring - pointer-events-none to allow clicking through */}
                     <div className="absolute inset-0 border border-green-200 rounded-full animate-spin-slow opacity-20 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex md:items-center h-full px-8">
                <div className="grid grid-cols-2 gap-8 w-full items-center">
                  {/* Left side - Text content */}
                  <div className="space-y-6">
                    <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium animate-fade-in">
                      للطالب
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 animate-slide-up leading-tight">
                        {slide.title}
                      </h3>
                      <p className="text-gray-600 mb-6 text-base lg:text-lg leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {slide.description}
                      </p>
                    </div>
                    
                    <ul className="space-y-3">
                      {slide.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-700 animate-slide-right" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full ml-2 flex-shrink-0 animate-pulse"></div>
                          <span className="text-base font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right side - Image */}
                  <div className="flex justify-center relative">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-2xl"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    
                    <div className="relative z-10 group">
                       <div className="relative transform transition-all duration-500 group-hover:scale-105">
                         <img
                           src={slide.image}
                           alt={slide.title}
                           onClick={() => setEnlargedImageIndex(index)}
                           className="w-full max-w-lg h-80 object-contain rounded-xl shadow-xl border border-white bg-white/10 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                         />
                          {/* Student Elements - pointer-events-none to allow clicking through */}
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-400 rounded-full animate-bounce pointer-events-none"></div>
                          <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-emerald-400 rounded-full animate-bounce pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                       
                       {/* Orbit Ring - pointer-events-none to allow clicking through */}
                       <div className="absolute inset-0 border-2 border-green-200 rounded-full animate-spin-slow opacity-20 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-green-50 text-green-600 p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-green-100 z-20"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-green-50 text-green-600 p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-green-100 z-20"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Enhanced Dots */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-4 sm:w-6 h-1.5 sm:h-2 bg-green-500 rounded-full' 
                  : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-200 hover:bg-green-300 rounded-full hover:scale-125'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Image Enlargement Dialog */}
      <Dialog open={enlargedImageIndex !== null} onOpenChange={() => setEnlargedImageIndex(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 bg-black/95 border-none overflow-hidden">
          <div className="relative h-full">
            {/* Close Button */}
            <button
              onClick={() => setEnlargedImageIndex(null)}
              className="absolute top-6 right-6 z-50 bg-red-500/80 hover:bg-red-500 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg border-2 border-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Navigation Arrows */}
            <button
              onClick={prevEnlargedImage}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 z-50 bg-gray-900/80 hover:bg-gray-900 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-xl border-2 border-white/30"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={nextEnlargedImage}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 z-50 bg-gray-900/80 hover:bg-gray-900 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-xl border-2 border-white/30"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            {/* Image Container */}
            {enlargedImageIndex !== null && (
              <div className="w-full h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <img
                    src={slides[enlargedImageIndex].image}
                    alt={slides[enlargedImageIndex].title}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                  />
                  <h3 className="text-white text-xl font-bold mt-4">{slides[enlargedImageIndex].title}</h3>
                  <p className="text-white/80 text-sm mt-2">{slides[enlargedImageIndex].description}</p>
                </div>
              </div>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
              <span className="text-white text-sm">
                {enlargedImageIndex !== null ? enlargedImageIndex + 1 : 0} / {slides.length}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentFeaturesSlider;