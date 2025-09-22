import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import './slider-animations.css';

const TeacherFeaturesSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [enlargedImageIndex, setEnlargedImageIndex] = useState<number | null>(null);

  const slides = [
    {
      title: 'مواد جاهزة حسب مناهج الوزارة',
      description: 'محتوى شامل لكل صف مطابق للمناهج الرسمية',
      image: '/teacher-features/teacher-dashboard.png',
      features: ['محتوى مطابق للمناهج', 'تحديث مستمر', 'جودة عالية']
    },
    {
      title: 'بنك أسئلة متطور',
      description: 'مولد امتحانات جاهزة مع الحلول الكاملة',
      image: '/teacher-features/class-management.png',
      features: ['آلاف الأسئلة', 'حلول مفصلة', 'تصنيف حسب الصعوبة']
    },
    {
      title: 'تقارير متابعة تفصيلية',
      description: 'متابعة كل طالب مع عرض الأسئلة غير المجاب عنها',
      image: '/teacher-features/student-management.png',
      features: ['تحليل الأداء', 'تقارير فورية', 'متابعة فردية']
    },
    {
      title: 'مواد جاهزة حسب مناهج الوزارة',
      description: 'محتوى شامل لكل صف مطابق للمناهج الرسمية',
      image: '/teacher-features/video-lessons.png',
      features: ['محتوى مطابق للمناهج', 'تحديث مستمر', 'جودة عالية']
    },
    {
      title: 'بنك أسئلة متطور',
      description: 'مولد امتحانات جاهزة مع الحلول الكاملة',
      image: '/teacher-features/bulk-student-upload.png',
      features: ['آلاف الأسئلة', 'حلول مفصلة', 'تصنيف حسب الصعوبة']
    },
    {
      title: 'تقارير متابعة تفصيلية',
      description: 'متابعة كل طالب مع عرض الأسئلة غير المجاب عنها',
      image: '/teacher-features/grade-content.png',
      features: ['تحليل الأداء', 'تقارير فورية', 'متابعة فردية']
    },
    {
      title: 'مواد جاهزة حسب مناهج الوزارة',
      description: 'محتوى شامل لكل صف مطابق للمناهج الرسمية',
      image: '/teacher-features/grade11-content.png',
      features: ['محتوى مطابق للمناهج', 'تحديث مستمر', 'جودة عالية']
    },
    {
      title: 'بنك أسئلة متطور',
      description: 'مولد امتحانات جاهزة مع الحلول الكاملة',
      image: '/teacher-features/vlan-lessons.png',
      features: ['آلاف الأسئلة', 'حلول مفصلة', 'تصنيف حسب الصعوبة']
    },
    {
      title: 'تقارير متابعة تفصيلية',
      description: 'متابعة كل طالب مع عرض الأسئلة غير المجاب عنها',
      image: '/teacher-features/peer-to-peer.png',
      features: ['تحليل الأداء', 'تقارير فورية', 'متابعة فردية']
    },
    {
      title: 'مواد جاهزة حسب مناهج الوزارة',
      description: 'محتوى شامل لكل صف مطابق للمناهج الرسمية',
      image: '/teacher-features/wireless-security.png',
      features: ['محتوى مطابق للمناهج', 'تحديث مستمر', 'جودة عالية']
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
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                  
                  <div className="relative z-10 group">
                     <div className="relative transform transition-all duration-500 group-hover:scale-105">
                       <img
                         src={slide.image}
                         alt={slide.title}
                         onClick={() => setEnlargedImageIndex(index)}
                         className="max-w-full max-h-[20rem] md:max-h-[24rem] lg:max-h-[28rem] w-auto h-auto rounded-2xl object-contain shadow-2xl border-4 border-white bg-white/10 cursor-pointer hover:shadow-3xl transition-shadow duration-300"
                       />
                        {/* Teacher Elements - pointer-events-none to allow clicking through */}
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-400 rounded-full animate-bounce pointer-events-none"></div>
                        <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-indigo-400 rounded-full animate-bounce pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                     
                     {/* Orbit Ring - pointer-events-none to allow clicking through */}
                     <div className="absolute inset-0 border-2 border-blue-200 rounded-full animate-spin-slow opacity-20 pointer-events-none"></div>
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

export default TeacherFeaturesSlider;