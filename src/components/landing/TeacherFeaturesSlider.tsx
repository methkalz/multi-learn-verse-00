import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="relative max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="relative h-80">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex flex-col md:flex-row h-full">
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  {slide.title}
                </h3>
                <p className="text-gray-600 mb-6 text-base md:text-lg leading-relaxed">
                  {slide.description}
                </p>
                <ul className="space-y-2">
                  {slide.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700 text-sm">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-blue-50">
                <div className="relative">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover shadow-lg"
                  />
                  <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full -z-10"></div>
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
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherFeaturesSlider;