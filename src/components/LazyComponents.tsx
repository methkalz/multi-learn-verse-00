import { lazy } from 'react';
import { SimpleErrorBoundary } from '@/lib/error-boundary';

// Lazy load components for better performance
export const LazyDashboard = lazy(() => import('@/pages/Dashboard'));
export const LazyAuth = lazy(() => import('@/pages/Auth'));
export const LazySuperAdminAuth = lazy(() => import('@/pages/SuperAdminAuth'));
export const LazySchoolManagement = lazy(() => import('@/pages/SchoolManagement'));
export const LazySchoolAdminManagement = lazy(() => import('@/pages/SchoolAdminManagement'));
export const LazyPluginManagement = lazy(() => import('@/pages/PluginManagement'));
export const LazyPackageManagement = lazy(() => import('@/pages/PackageManagement'));
export const LazyAcademicYears = lazy(() => import('@/pages/AcademicYears'));
export const LazyCalendarManagement = lazy(() => import('@/pages/CalendarManagement'));
export const LazySchoolClasses = lazy(() => import('@/pages/SchoolClasses'));
export const LazyUserManagement = lazy(() => import('@/pages/UserManagement'));
export const LazySystemSettings = lazy(() => import('@/pages/SystemSettings'));
export const LazyContentManagement = lazy(() => import('@/pages/ContentManagement'));
export const LazyGrade10Management = lazy(() => import('@/pages/Grade10Management'));
export const LazyGrade11Management = lazy(() => import('@/pages/Grade11Management'));
export const LazyGrade12Management = lazy(() => import('@/pages/Grade12Management'));
export const LazyStudentManagement = lazy(() => import('@/pages/StudentManagement'));
export const LazyTest = lazy(() => import('@/pages/Test'));
export const LazyQuestionManagement = lazy(() => import('@/pages/QuestionManagement'));
export const LazyPairMatchingPage = lazy(() => import('@/pages/PairMatchingPage'));

// HOC for lazy components with error boundary
export const withLazyLoading = (Component: React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>) => {
  return (props: Record<string, unknown>) => (
    <SimpleErrorBoundary>
      <Component {...props} />
    </SimpleErrorBoundary>
  );
};