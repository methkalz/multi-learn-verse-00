import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  MessageSquare, 
  Target, 
  Settings,
  Sparkles,
  CheckCircle
} from 'lucide-react';

interface TabConfig {
  value: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  gradient: string;
  description?: string;
}

interface EnhancedProjectTabsProps {
  tabs: TabConfig[];
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export const EnhancedProjectTabs: React.FC<EnhancedProjectTabsProps> = ({
  tabs,
  defaultValue,
  children,
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <Tabs defaultValue={defaultValue} className="w-full">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 p-1 shadow-xl border border-slate-200/50">
          <TabsList className="grid w-full bg-transparent gap-1 h-auto p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "relative overflow-hidden rounded-xl h-auto p-4 transition-all duration-300",
                  "data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20",
                  "data-[state=active]:bg-white data-[state=active]:text-slate-800",
                  "data-[state=inactive]:hover:bg-white/50 data-[state=inactive]:text-slate-600",
                  "group"
                )}
              >
                {/* خلفية متدرجة للـ tab النشط */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300",
                  tab.gradient
                )} />
                
                {/* محتوى الـ tab */}
                <div className="relative z-10 flex flex-col items-center gap-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      "group-data-[state=active]:bg-white/80 group-data-[state=active]:shadow-sm",
                      "group-data-[state=inactive]:bg-white/30"
                    )}>
                      {tab.icon}
                    </div>
                    
                    {tab.badge && (
                      <Badge variant="secondary" className={cn(
                        "text-xs font-medium transition-all duration-300",
                        "group-data-[state=active]:bg-blue-100 group-data-[state=active]:text-blue-700 group-data-[state=active]:shadow-sm",
                        "group-data-[state=inactive]:bg-white/40 group-data-[state=inactive]:text-slate-600"
                      )}>
                        {tab.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-sm leading-tight">
                      {tab.label}
                    </div>
                    {tab.description && (
                      <div className="text-xs opacity-70 mt-1 truncate max-w-20">
                        {tab.description}
                      </div>
                    )}
                  </div>
                  
                  {/* مؤشر التفعيل */}
                  <div className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full transition-all duration-300",
                    "group-data-[state=active]:bg-gradient-to-r group-data-[state=active]:from-blue-500 group-data-[state=active]:to-purple-500",
                    "group-data-[state=active]:shadow-lg group-data-[state=active]:shadow-blue-500/30"
                  )} />
                </div>
                
                {/* تأثير الانتشار عند التحويم */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/20 to-white/10 pointer-events-none" />
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* محتوى التابس */}
        <div className="mt-6">
          {children}
        </div>
      </Tabs>
    </div>
  );
};

// مكون محسن لمحتوى التاب
interface EnhancedTabContentProps {
  value: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const EnhancedTabContent: React.FC<EnhancedTabContentProps> = ({
  value,
  title,
  description,
  children,
  className
}) => {
  return (
    <TabsContent value={value} className="space-y-6">
      {(title || description) && (
        <div className="text-center space-y-2 py-4">
          {title && (
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={cn("animate-fade-in", className)}>
        {children}
      </div>
    </TabsContent>
  );
};

// تصدير تابس محسنة خاصة بالمشروع
interface ProjectTabsProps {
  projectId: string;
  hasComments?: number;
  hasTasks?: number;
  children: React.ReactNode;
  defaultTab?: string;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
  projectId,
  hasComments = 0,
  hasTasks = 0,
  children,
  defaultTab = "content"
}) => {
  const tabs: TabConfig[] = [
    {
      value: "content",
      label: "المحتوى",
      icon: <FileText className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
      description: "محرر النصوص"
    },
    {
      value: "tasks",
      label: "المهام",
      icon: <Target className="h-5 w-5" />,
      badge: hasTasks > 0 ? hasTasks : undefined,
      gradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
      description: "قائمة المهام"
    },
    {
      value: "comments",
      label: "التعليقات",
      icon: <MessageSquare className="h-5 w-5" />,
      badge: hasComments > 0 ? hasComments : undefined,
      gradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
      description: "النقاش والتقييم"
    },
    {
      value: "settings",
      label: "الإعدادات",
      icon: <Settings className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
      description: "خيارات المشروع"
    }
  ];

  return (
    <EnhancedProjectTabs 
      tabs={tabs} 
      defaultValue={defaultTab}
      className="w-full"
    >
      {children}
    </EnhancedProjectTabs>
  );
};