import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface OrphanedUser {
  id: string;
  email: string;
  created_at: string;
}

interface CleanupResult {
  success: boolean;
  orphanedUsersCount: number;
  orphanedUsers?: OrphanedUser[];
  deletedCount?: number;
  errors?: string[];
  message?: string;
}

export const OrphanedUsersCleanup: React.FC = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<CleanupResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Only show to superadmins
  if (userProfile?.role !== 'superadmin') {
    return null;
  }

  const scanOrphanedUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-orphaned-users', {
        body: {
          dryRun: true
        }
      });

      if (error) throw error;

      setScanResult(data);
      setShowConfirmation(false);
      
      toast.success(`تم العثور على ${data.orphanedUsersCount} مستخدم معلق`);
    } catch (error) {
      console.error('Error scanning orphaned users:', error);
      toast.error('فشل في فحص المستخدمين المعلقين');
    } finally {
      setLoading(false);
    }
  };

  const deleteOrphanedUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-orphaned-users', {
        body: {
          dryRun: false,
          confirmDelete: true
        }
      });

      if (error) throw error;

      setScanResult(data);
      setShowConfirmation(false);
      
      toast.success(`تم حذف ${data.deletedCount} مستخدم معلق بنجاح`);
    } catch (error) {
      console.error('Error deleting orphaned users:', error);
      toast.error('فشل في حذف المستخدمين المعلقين');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          تنظيف المستخدمين المعلقين
        </CardTitle>
        <CardDescription>
          فحص وحذف المستخدمين الذين لا يملكون بيانات profiles أو records في النظام
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={scanOrphanedUsers}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'جاري الفحص...' : 'فحص المستخدمين المعلقين'}
          </Button>
          
          {scanResult && scanResult.orphanedUsersCount > 0 && (
            <Button 
              onClick={() => setShowConfirmation(true)}
              disabled={loading}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              حذف المستخدمين المعلقين
            </Button>
          )}
        </div>

        {showConfirmation && scanResult && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">
                  هل أنت متأكد من حذف {scanResult.orphanedUsersCount} مستخدم معلق؟
                </p>
                <p className="text-sm text-gray-600">
                  هذا الإجراء لا يمكن التراجع عنه وسيؤدي إلى حذف هؤلاء المستخدمين نهائياً من النظام.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button 
                    onClick={deleteOrphanedUsers}
                    disabled={loading}
                    variant="destructive"
                    size="sm"
                  >
                    {loading ? 'جاري الحذف...' : 'نعم، احذف نهائياً'}
                  </Button>
                  <Button 
                    onClick={() => setShowConfirmation(false)}
                    variant="outline"
                    size="sm"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {scanResult && (
          <div className="space-y-4">
            <Alert className={scanResult.orphanedUsersCount > 0 ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">
                    {scanResult.orphanedUsersCount > 0 
                      ? `تم العثور على ${scanResult.orphanedUsersCount} مستخدم معلق`
                      : 'لا توجد مستخدمين معلقين في النظام'}
                  </p>
                  {scanResult.message && (
                    <p className="text-sm">{scanResult.message}</p>
                  )}
                  {scanResult.deletedCount !== undefined && (
                    <p className="text-sm text-green-600">
                      تم حذف {scanResult.deletedCount} مستخدم بنجاح
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {scanResult.orphanedUsers && scanResult.orphanedUsers.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">المستخدمين المعلقين:</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {scanResult.orphanedUsers.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          تاريخ الإنشاء: {new Date(user.created_at).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{user.id.slice(0, 8)}...</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scanResult.errors && scanResult.errors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">أخطاء أثناء الحذف:</p>
                    <ul className="text-sm space-y-1">
                      {scanResult.errors.map((error, index) => (
                        <li key={index} className="text-red-600">• {error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};