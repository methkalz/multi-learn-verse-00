/**
 * Image Slider Component for Landing Page
 * Displays screenshots of different dashboard views
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SlideImage {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'teacher' | 'student' | 'admin' | 'games';
}

const slides: SlideImage[] = [
  {
    id: '1',
    title: 'لوحة تحكم المعلم',
    description: 'واجهة شاملة لإدارة المحتوى والطلاب والتقارير',
    image: '/avatars/teacher-male-1.png',
    category: 'teacher'
  },
  {
    id: '2',
    title: 'إدارة المحتوى للمعلم',
    description: 'أدوات متقدمة لإنشاء وتعديل المحتوى التعليمي',
    image: '/avatars/teacher-female-1.png',
    category: 'teacher'
  },
  {
    id: '3',
    title: 'تقارير المعلم المفصلة',
    description: 'متابعة تقدم الطلاب وتحليل الأداء',
    image: '/avatars/teacher-male-2.png',
    category: 'teacher'
  },
  {
    id: '4', 
    title: 'لوحة تحكم الطالب',
    description: 'بيئة تعليمية تفاعلية مع الألعاب والمحتوى',
    image: '/avatars/student-boy-1.png',
    category: 'student'
  },
  {
    id: '5',
    title: 'الألعاب التعليمية للطلاب',
    description: 'ألعاب تفاعلية محفزة لتعزيز التعلم',
    image: '/avatars/student-creative.png',
    category: 'student'
  },
  {
    id: '6',
    title: 'مكتبة المواد للطلاب',
    description: 'وصول سهل لجميع المواد والفيديوهات التعليمية',
    image: '/avatars/student-girl-1.png',
    category: 'student'
  },
  {
    id: '7',
    title: 'لوحة إدارة المدرسة',
    description: 'إحصائيات وتقارير شاملة للإدارة',
    image: '/avatars/admin-school-formal.png',
    category: 'admin'
  },
  {
    id: '8',
    title: 'إدارة المدرسين والطلاب',
    description: 'أدوات شاملة لإدارة المستخدمين والصلاحيات',
    image: '/avatars/admin-school-female.png',
    category: 'admin'
  },
  {
    id: '9',
    title: 'تقارير الإدارة المتقدمة',
    description: 'لوحات معلومات تفاعلية للمتابعة الإدارية',
    image: '/avatars/admin-school-male.png',
    category: 'admin'
  }
];

export const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Main Slider */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full">
              <Card className="border-0 shadow-none">
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
                  {/* Placeholder for actual dashboard screenshot */}
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{slide.title}</h3>
                    <p className="text-gray-600 max-w-md mx-auto">{slide.description}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide 
                ? 'bg-primary scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Slide Categories by Type */}
      <div className="mt-8 space-y-4">
        {/* Teacher Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3 text-center">🎓 لوحات المعلم</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {slides.filter(slide => slide.category === 'teacher').map((slide, index) => {
              const slideIndex = slides.findIndex(s => s.id === slide.id);
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(slideIndex)}
                  className={`p-3 rounded-lg text-sm transition-all duration-200 ${
                    slideIndex === currentSlide
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {slide.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Student Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3 text-center">👩‍🎓 لوحات الطالب</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {slides.filter(slide => slide.category === 'student').map((slide, index) => {
              const slideIndex = slides.findIndex(s => s.id === slide.id);
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(slideIndex)}
                  className={`p-3 rounded-lg text-sm transition-all duration-200 ${
                    slideIndex === currentSlide
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {slide.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3 text-center">🏫 لوحات الإدارة</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {slides.filter(slide => slide.category === 'admin').map((slide, index) => {
              const slideIndex = slides.findIndex(s => s.id === slide.id);
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(slideIndex)}
                  className={`p-3 rounded-lg text-sm transition-all duration-200 ${
                    slideIndex === currentSlide
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {slide.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};