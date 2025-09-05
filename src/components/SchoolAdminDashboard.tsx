import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { School, Users, BookOpen, Settings, Package, Calendar, TrendingUp, Shield, CreditCard, Clock, Activity, Globe } from 'lucide-react';
import { SchoolCalendarWidget } from '@/components/calendar/SchoolCalendarWidget';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TeacherManagement } from './TeacherManagement';
import { logger } from '@/lib/logger';
interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClasses: number;
  archivedClasses: number;
  activePlugins: number;
  totalPlugins: number;
}
interface SchoolPackage {
  id: string;
  name: string;
  name_ar: string;
  description_ar: string;
  max_students: number;
  max_teachers: number;
  start_date: string;
  end_date: string;
  status: string;
  features: string[];
  price: number;
  currency: string;
  duration_days: number | null;
}
const SchoolAdminDashboard = () => {
  const navigate = useNavigate();
  const {
    userProfile
  } = useAuth();
  const [stats, setStats] = useState<SchoolStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeClasses: 0,
    archivedClasses: 0,
    activePlugins: 0,
    totalPlugins: 0
  });
  const [schoolPackage, setSchoolPackage] = useState<SchoolPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTeacherManagement, setShowTeacherManagement] = useState(false);
  useEffect(() => {
    if (userProfile?.school_id) {
      fetchSchoolStats();
      fetchSchoolPackage();
    }
  }, [userProfile?.school_id]);
  const fetchSchoolStats = async () => {
    try {
      const schoolId = userProfile?.school_id;
      if (!schoolId) return;

      // Get students count from students table
      const {
        count: studentsCount
      } = await supabase.from('students').select('*', {
        count: 'exact',
        head: true
      }).eq('school_id', schoolId);

      // Get teachers count from profiles table
      const {
        count: teachersCount
      } = await supabase.from('profiles').select('*', {
        count: 'exact',
        head: true
      }).eq('school_id', schoolId).eq('role', 'teacher');

      // Get classes stats
      const {
        count: totalClassesCount
      } = await supabase.from('classes').select('*', {
        count: 'exact',
        head: true
      }).eq('school_id', schoolId);
      const {
        count: activeClassesCount
      } = await supabase.from('classes').select('*', {
        count: 'exact',
        head: true
      }).eq('school_id', schoolId).eq('status', 'active');

      // Get plugins count (this might need adjustment based on your schema)
      const {
        count: totalPluginsCount
      } = await supabase.from('plugins').select('*', {
        count: 'exact',
        head: true
      });
      const {
        count: activePluginsCount
      } = await supabase.from('school_plugins').select('*', {
        count: 'exact',
        head: true
      }).eq('school_id', schoolId).eq('status', 'enabled');
      setStats({
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        totalClasses: totalClassesCount || 0,
        activeClasses: activeClassesCount || 0,
        archivedClasses: (totalClassesCount || 0) - (activeClassesCount || 0),
        activePlugins: activePluginsCount || 0,
        totalPlugins: totalPluginsCount || 0
      });
    } catch (error) {
      logger.error('Error fetching school stats', error as Error);
    } finally {
      setLoading(false);
    }
  };
  const fetchSchoolPackage = async () => {
    try {
      const schoolId = userProfile?.school_id;
      if (!schoolId) return;

      // Get active school package
      const {
        data: packageData
      } = await supabase.from('school_packages').select('*').eq('school_id', schoolId).eq('status', 'active').single();
      if (packageData) {
        // Get package details
        const {
          data: packageDetails
        } = await supabase.from('packages').select('*').eq('id', packageData.package_id).single();
        if (packageDetails) {
          setSchoolPackage({
            id: packageData.id,
            name: packageDetails.name,
            name_ar: packageDetails.name_ar,
            description_ar: packageDetails.description_ar,
            max_students: packageDetails.max_students,
            max_teachers: packageDetails.max_teachers,
            start_date: packageData.start_date,
            end_date: packageData.end_date,
            status: packageData.status,
            features: Array.isArray(packageDetails.features) ? packageDetails.features.map(f => String(f)) : [],
            price: packageDetails.price,
            currency: packageDetails.currency || 'USD',
            duration_days: packageDetails.duration_days
          });
        }
      }
    } catch (error) {
      logger.error('Error fetching school package', error as Error);
    }
  };
  const getUsagePercentage = (used: number, max: number) => {
    if (!max) return 0;
    return Math.min(used / max * 100, 100);
  };
  const getDaysRemaining = () => {
    if (!schoolPackage?.end_date) return null;
    const endDate = new Date(schoolPackage.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  const getDaysRemainingDisplay = () => {
    // إذا كانت الباقة بأيام غير محدودة (duration_days = null أو -1)
    if (!schoolPackage?.duration_days || schoolPackage.duration_days === -1) {
      return "غير محدود";
    }
    const days = getDaysRemaining();
    return days !== null ? days.toString() : "0";
  };
  const getSubscriptionEndDisplay = () => {
    if (!schoolPackage?.end_date) return "اشتراك دائم";
    const endDate = new Date(schoolPackage.end_date);
    const year = endDate.getFullYear();

    // إذا كان التاريخ 1970 أو قبله، فهو اشتراك دائم
    if (year <= 1970) {
      return "اشتراك دائم";
    }

    // إذا كانت الباقة بأيام غير محدودة
    if (!schoolPackage?.duration_days || schoolPackage.duration_days === -1) {
      return "اشتراك دائم";
    }
    return format(endDate, 'dd.M.yyyy');
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-4 gradient-electric rounded-full animate-gentle-float flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>;
  }
  if (showTeacherManagement) {
    return <TeacherManagement onBack={() => setShowTeacherManagement(false)} />;
  }
  return <div className="min-h-screen bg-background pattern-dots flex flex-col" dir="rtl">
      {/* Modern Header مع الإعدادات المخصصة والتأثيرات */}
      <header className="glass-card sticky top-0 z-50 soft-shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
        
      </header>

      <div className="container mx-auto px-6 py-6 space-y-8">
        {/* Stats Grid */}
        <section className="animate-fade-in-up">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold font-cairo text-foreground">📊 الإحصائيات</h2>
            <div className="accent-dot mr-3 animate-gentle-float"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Students Card */}
            <Card className="glass-card card-hover animate-scale-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-primary icon-glow icon-bounce" />
                  <span className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full soft-shadow">
                    +{stats.totalStudents}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient mb-2">{stats.totalStudents}</div>
                <p className="text-muted-foreground text-sm">إجمالي الطلاب</p>
              </CardContent>
            </Card>

            {/* Teachers Card */}
            <Card className="glass-card card-hover animate-scale-hover" style={{
            animationDelay: '100ms'
          }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-secondary icon-glow icon-bounce" />
                  <span className="text-sm text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full soft-shadow">
                    +{stats.totalTeachers}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient mb-2">{stats.totalTeachers}</div>
                <p className="text-muted-foreground text-sm">إجمالي المعلمين</p>
              </CardContent>
            </Card>

            {/* Classes Card */}
            <Card className="glass-card card-hover animate-scale-hover" style={{
            animationDelay: '200ms'
          }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <BookOpen className="h-8 w-8 text-orange-500 icon-glow icon-bounce" />
                  <span className="text-sm text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded-full soft-shadow">
                    {stats.activeClasses}/{stats.totalClasses}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient mb-2">{stats.totalClasses}</div>
                <p className="text-muted-foreground text-sm">إجمالي الصفوف</p>
              </CardContent>
            </Card>

            {/* Plugins Card */}
            <Card className="glass-card card-hover animate-scale-hover" style={{
            animationDelay: '300ms'
          }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Package className="h-8 w-8 text-purple-500 icon-glow icon-bounce" />
                  <span className="text-sm text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded-full soft-shadow">
                    {stats.activePlugins}/{stats.totalPlugins}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient mb-2">{stats.activePlugins}</div>
                <p className="text-muted-foreground text-sm">الإضافات النشطة</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="animate-fade-in-up" style={{
        animationDelay: '200ms'
      }}>
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold font-cairo text-foreground">⚡ الإجراءات السريعة</h2>
            <div className="accent-dot mr-3"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[{
            name: 'إدارة الطلاب',
            icon: Users,
            path: '/students'
          }, {
            name: 'إدارة المعلمين',
            icon: Users,
            action: () => setShowTeacherManagement(true)
          }, {
            name: 'إدارة الصفوف',
            icon: BookOpen,
            path: '/school-classes'
          }, {
            name: 'المحتوى التعليمي',
            icon: BookOpen,
            path: '/content-management'
          }, {
            name: 'الإعدادات',
            icon: Settings,
            path: '/system-settings'
          }].map((action, index) => <Card key={action.name} className="glass-card card-hover animate-scale-hover cursor-pointer group" style={{
            animationDelay: `${index * 50}ms`
          }} onClick={() => action.path ? navigate(action.path) : action.action?.()}>
                <CardContent className="p-4 text-center flex flex-col items-center justify-center">
                  <action.icon className="h-8 w-8 text-primary mx-auto mb-3 icon-glow group-hover:animate-gentle-float transition-all" />
                  <p className="text-foreground font-medium text-sm">{action.name}</p>
                </CardContent>
              </Card>)}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up -mt-[200px]" style={{
        animationDelay: '300ms'
      }}>
          {/* Right Column - Calendar and School Admin Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* School Calendar Widget */}
            <SchoolCalendarWidget />
            
            {/* School Admin Profile Card */}
            <Card className="glass-card soft-shadow card-hover">
              <CardHeader className="text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 mx-auto btn-elegant rounded-full flex items-center justify-center mb-4 animate-gentle-float">
                  <School className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="font-cairo text-lg text-gradient">
                  {userProfile?.full_name || 'مدير المدرسة'}
                </CardTitle>
                <CardDescription>
                  <span className="px-3 py-1 rounded-full text-xs btn-elegant text-white font-medium">
                    🎖️ مدير مدرسة
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">📧 البريد الإلكتروني</p>
                  <p className="font-medium text-xs glass-card rounded-lg p-2 break-all">{userProfile?.email}</p>
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">🏫 المؤسسة التعليمية</p>
                  <p className="font-medium text-sm text-gradient">
                    🌟 مدرسة نشطة ومتصلة
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 mt-6">
                  <Button size="sm" className="btn-elegant" onClick={() => navigate('/system-settings')}>
                    <Settings className="h-4 w-4 ml-1" />
                    إعدادات المدرسة
                  </Button>
                  <Button size="sm" variant="outline" className="card-hover" onClick={() => setShowTeacherManagement(true)}>
                    <Users className="h-4 w-4 ml-1" />
                    إدارة المعلمين
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Package Information */}
          {schoolPackage && <div className="lg:col-span-2">
              <Card className="glass-card soft-shadow border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <Package className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">باقة الاشتراك الحالية</CardTitle>
                        <CardDescription>تفاصيل الخطة والاستخدام</CardDescription>
                      </div>
                    </div>
                    
                    <Badge variant={schoolPackage.status === 'active' ? 'default' : 'secondary'} className={schoolPackage.status === 'active' ? 'gradient-electric text-white' : ''}>
                      {schoolPackage.status === 'active' ? 'نشطة' : 'غير نشطة'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-lg text-primary">{schoolPackage.name_ar}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{schoolPackage.description_ar}</p>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center space-x-reverse space-x-2">
                        <CreditCard className="w-5 h-5 text-secondary" />
                        <span className="font-semibold text-lg">{schoolPackage.price} {schoolPackage.currency === 'ILS' ? '₪' : schoolPackage.currency}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 text-center">السعر السنوي</p>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center space-x-reverse space-x-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="font-semibold text-lg">{getDaysRemainingDisplay()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 text-center">
                        {getDaysRemainingDisplay() === "غير محدود" ? "مدة الاشتراك" : "يوم متبقي"}
                      </p>
                    </div>
                  </div>

                  {/* Usage Statistics */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base">إحصائيات الاستخدام</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Students Usage */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>الطلاب</span>
                          <span>{stats.totalStudents} / {schoolPackage.max_students || '∞'}</span>
                        </div>
                        <Progress value={getUsagePercentage(stats.totalStudents, schoolPackage.max_students)} className="h-2" />
                      </div>
                      
                      {/* Teachers Usage */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>المعلمين</span>
                          <span>{stats.totalTeachers} / {schoolPackage.max_teachers || '∞'}</span>
                        </div>
                        <Progress value={getUsagePercentage(stats.totalTeachers, schoolPackage.max_teachers)} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {/* Package Features */}
                  {schoolPackage.features && schoolPackage.features.length > 0 && <div className="space-y-3">
                      <h4 className="font-semibold text-base">مميزات الباقة</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {schoolPackage.features.map((feature, index) => <div key={index} className="flex items-center space-x-reverse space-x-2">
                            <div className="w-2 h-2 rounded-full gradient-primary"></div>
                            <span className="text-sm">{feature}</span>
                          </div>)}
                      </div>
                    </div>}

                  {/* Subscription Period */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 inline ml-1" />
                      بداية الاشتراك: {format(new Date(schoolPackage.start_date), 'dd.M.yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      انتهاء الاشتراك: {getSubscriptionEndDisplay()}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Activities Card */}
              <Card className="glass-card soft-shadow mt-6">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-bold font-cairo text-foreground">🔥 النشاطات الحديثة</h3>
                    <div className="accent-dot mr-3 animate-gentle-float"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[{
                  title: 'تم إضافة طالب جديد',
                  time: 'منذ دقيقتين',
                  icon: Users,
                  color: 'green-neon'
                }, {
                  title: 'تحديث في منهج الشبكات',
                  time: 'منذ 5 دقائق',
                  icon: BookOpen,
                  color: 'blue-electric'
                }, {
                  title: 'تم إنشاء فصل جديد',
                  time: 'منذ 10 دقائق',
                  icon: School,
                  color: 'orange-fire'
                }, {
                  title: 'تحديث الإعدادات',
                  time: 'منذ 15 دقيقة',
                  icon: Settings,
                  color: 'purple-mystic'
                }].map((activity, index) => <div key={index} className="flex items-center space-x-reverse space-x-3 p-4 glass-card card-hover group">
                      <div className="w-3 h-3 rounded-full bg-primary animate-gentle-float"></div>
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <activity.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{activity.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <Clock className="h-3 w-3 ml-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>)}
                </CardContent>
              </Card>
            </div>}
        </div>
      </div>
    </div>;
};
export default SchoolAdminDashboard;