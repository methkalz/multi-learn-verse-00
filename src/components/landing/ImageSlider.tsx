import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SliderImage {
  url: string;
  title: string;
  description: string;
}

interface ImageSliderProps {
  section: 'teachers' | 'students' | 'admin';
}

const ImageSlider: React.FC<ImageSliderProps> = ({ section }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // تصاوير مختلفة لكل قسم (3 صور لكل قسم)
  const images: Record<string, SliderImage[]> = {
    teachers: [
      {
        url: '/public/avatars/teacher-male-1.png',
        title: 'لوحة تحكم المعلم',
        description: 'واجهة سهلة ومتقدمة لإدارة الصفوف والطلاب'
      },
      {
        url: '/public/avatars/teacher-female-1.png', 
        title: 'تصحيح تلقائي',
        description: 'نظام ذكي لتصحيح الامتحانات والواجبات'
      },
      {
        url: '/public/avatars/teacher-male-2.png',
        title: 'تقارير شاملة',
        description: 'متابعة تقدم الطلاب وتحليل الأداء'
      }
    ],
    students: [
      {
        url: '/public/avatars/student-boy-1.png',
        title: 'تعلم تفاعلي',
        description: 'ألعاب تعليمية ممتعة وفعالة'
      },
      {
        url: '/public/avatars/student-girl-1.png',
        title: 'فيديوهات تعليمية',
        description: 'شروحات مصورة لبرنامج Packet Tracer'
      },
      {
        url: '/public/avatars/student-creative.png',
        title: 'مشاريع عملية',
        description: 'حفظ آمن ومتابعة للمشاريع الشخصية'
      }
    ],
    admin: [
      {
        url: '/public/avatars/admin-school-male.png',
        title: 'إدارة شاملة',
        description: 'متابعة جميع المعلمين والطلاب'
      },
      {
        url: '/public/avatars/admin-school-female.png',
        title: 'تقارير إحصائية',
        description: 'تحليل أداء المدرسة ومستوى التحصيل'
      },
      {
        url: '/public/avatars/admin-school-formal.png',
        title: 'تواصل فعال',
        description: 'نظام إشعارات متقدم للأهل والمعلمين'
      }
    ]
  };

  const sectionImages = images[section] || [];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % sectionImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sectionImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % sectionImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + sectionImages.length) % sectionImages.length);
  };

  if (sectionImages.length === 0) return null;

  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* الصور */}
      <div className="relative w-full h-full">
        {sectionImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <img 
                  src={image.url} 
                  alt={image.title}
                  className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">{image.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{image.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* أزرار التنقل */}
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      {/* مؤشرات الصور */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {sectionImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-primary w-6' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;