import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './slider-animations.css';

const StudentFeaturesSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'الصف العاشر',
      description: 'التعرف على نظام ويندوز متقدمة في الشبكات، ومشاريع متقدمة مع فيديوهات عملية التنفيذ مفتوح للشباب',
      avatar: '/avatars/student-boy-1.png',
      gradeIcon: '🎯',
      grade: '10',
      image: '/student-features/student-projects.png',
      features: ['مشاريع التخرج', 'فيديوهات عملية', 'فحص الشباب', 'متابعة مستمرة']
    },
    {
      title: 'الصف الحادي عشر',
      description: 'المناهج المطلوبة (x70) لامتحان البحوث',
      avatar: '/avatars/student-girl-1.png',
      gradeIcon: '📚',
      grade: '11',
      image: '/student-features/student-progress.png',
      features: ['منهج البحوث', '70% من المطلوب', 'تحضير شامل', 'مهارات تحرية']
    },
    {
      title: 'الصف الثاني عشر',
      description: 'مهام قصيرة وفيديوهات عملية التنفيذ مفتوح للشباب، متابعة النشاطات، ومشاريع متقدمة مع فيديوهات تعليمية',
      avatar: '/avatars/student-creative.png',
      gradeIcon: '🎓',
      grade: '12',
      image: '/student-features/student-dashboard.png',
      features: ['مشاريع تخرج', 'فيديوهات', 'مقدمة الشبكات', 'مشاريع متقدمة', 'فيديوهات تعليمية']
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
        <div className="relative h-96 px-16">
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
              <div className="flex flex-col md:flex-row h-full px-4">
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative">
                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-20 h-20 bg-green-100 rounded-full opacity-30 animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-14 h-14 bg-emerald-200 rounded-full opacity-20 animate-bounce"></div>
                  
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
                          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full ml-2 flex-shrink-0 animate-pulse"></div>
                          <span className="text-base font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100"></div>
                  <div className="absolute top-0 left-0 w-28 h-28 bg-green-200 rounded-full opacity-20 animate-float"></div>
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-emerald-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
                  
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center space-y-4">
                    {/* Grade Badge */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg mb-2">
                      الصف {slide.grade}
                    </div>

                    {/* Feature Image */}
                    <div className="relative group">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full max-w-sm h-48 md:h-56 object-cover rounded-lg shadow-xl border-2 border-white/20 transform transition-all duration-500 group-hover:scale-105"
                      />
                      
                      {/* Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                      
                      {/* Grade Icon */}
                      <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl border-2 border-gray-100">
                        {slide.gradeIcon}
                      </div>
                    </div>

                    {/* Student Avatar */}
                    <div className="relative">
                      <img
                        src={slide.avatar}
                        alt={slide.title}
                        className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-white"
                      />
                      
                      {/* Floating Grade Number */}
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-bounce flex items-center justify-center text-white text-xs font-bold">
                        {slide.grade}
                      </div>
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
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-green-50 text-green-600 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-green-100 z-20"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-green-50 text-green-600 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-green-100 z-20"
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
                  ? 'w-6 h-2 bg-green-500 rounded-full' 
                  : 'w-2 h-2 bg-green-200 hover:bg-green-300 rounded-full hover:scale-125'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentFeaturesSlider;