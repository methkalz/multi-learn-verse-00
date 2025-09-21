import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  const handleWhatsAppClick = () => {
    // رقم الواتساب المطلوب التواصل معه
    const phoneNumber = '972000000000'; // يجب تغيير هذا الرقم
    const message = encodeURIComponent('مرحباً، أرغب في معرفة المزيد عن منصة التقنية ببساطة للتعليم الإلكتروني');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 left-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-50 animate-pulse hover:animate-none group"
      aria-label="تواصل معنا عبر الواتساب"
    >
      <div className="flex items-center gap-2">
        <MessageCircle size={24} />
        <span className="hidden group-hover:block whitespace-nowrap text-sm font-medium">
          تواصل معنا
        </span>
      </div>
    </button>
  );
};

export default WhatsAppButton;