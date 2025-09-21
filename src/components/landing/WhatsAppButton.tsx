/**
 * WhatsApp Direct Contact Button
 * Opens WhatsApp with pre-filled message
 */

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'footer';
}

export const WhatsAppButton = ({ 
  phoneNumber = '0528359103',
  message = 'مرحبا.. معني بالحصول على تفاصيل أكثر عن النظام المميز',
  className = '',
  size = 'lg',
  variant = 'default'
}: WhatsAppButtonProps) => {
  
  const openWhatsApp = () => {
    // Format phone number (remove any non-numeric characters and add country code if needed)
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const fullNumber = formattedNumber.startsWith('972') ? formattedNumber : `972${formattedNumber.substring(1)}`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${fullNumber}?text=${encodedMessage}`;
    
    // Open in new window/tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={openWhatsApp}
        className={`fixed bottom-6 left-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 ${className}`}
        aria-label="تواصل عبر الواتساب"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  if (variant === 'footer') {
    return (
      <button
        onClick={openWhatsApp}
        className={`text-gray-400 hover:text-white transition-colors flex items-center gap-2 ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        واتساب: {phoneNumber}
      </button>
    );
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <Button
      onClick={openWhatsApp}
      className={`bg-green-500 hover:bg-green-600 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${sizeClasses[size]} ${className}`}
    >
      <MessageCircle className="ml-2 h-5 w-5" />
      اطلب الآن
    </Button>
  );
};