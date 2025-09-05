import React from 'react';
import { BookOpen } from 'lucide-react';
import AppHeader from '@/components/shared/AppHeader';
import AppFooter from '@/components/shared/AppFooter';
import GradeCards from '@/components/content/GradeCards';

const ContentManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <AppHeader 
        title="إدارة مضامين الصفوف" 
        showBackButton={true}
        backPath="/dashboard"
        showLogout={true}
      />
      
      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-3 rounded-full">
              <BookOpen className="h-6 w-6" />
              <span className="font-semibold">نظام إدارة المضامين التعليمية</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground text-center">
              إدارة المضامين التعليمية
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              قم بإدارة وتنظيم المحتوى التعليمي للصفوف الدراسية المختلفة بطريقة سهلة ومنظمة
            </p>
          </div>
          
          <div className="animate-fade-in">
            <GradeCards />
          </div>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
};

export default ContentManagement;