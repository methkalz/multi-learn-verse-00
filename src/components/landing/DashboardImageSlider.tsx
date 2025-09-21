import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DashboardImageSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'لوحة المعلم',
      description: 'إدارة شاملة للمحتوى والطلاب',
      image: '/avatars/teacher-female-1.png',
      features: ['مواد جاهزة حسب مناهج الوزارة', 'بنك أسئلة متطور', 'تقارير متابعة تفصيلية']
    },
    {
      title: 'لوحة الطالب',
      description: 'تعلم تفاعلي وممتع',
      image: '/avatars/student-boy-1.png',
      features: ['ألعاب تعليمية محفزة', 'فيديوهات Packet Tracer', 'نظام تحفيزي ذكي']
    },
    {
      title: 'لوحة الإدارة',
      description: 'متابعة وتحليل شامل',
      image: '/avatars/admin-school-female.png',
      features: ['تقارير شاملة للمستوى', 'تقوية العلاقة مع الأهالي', 'تقليل نسب الغش']
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="relative h-96 md:h-80">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex flex-col md:flex-row h-full">
              <div className="flex-1 p-8 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                  {slide.title}
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {slide.description}
                </p>
                <ul className="space-y-2">
                  {slide.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="relative">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg"
                  />
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full -z-10"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardImageSlider;