import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image, Globe } from 'lucide-react';
import { logger } from '@/lib/logger';

interface LessonImageFormProps {
  onSave: (imageData: any) => void;
  onCancel: () => void;
}

const LessonImageForm: React.FC<LessonImageFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    alt_text: '',
    source_type: 'upload'
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // في التطبيق الحقيقي، يجب رفع الملف إلى Supabase Storage
      const tempUrl = URL.createObjectURL(file);
      handleInputChange('image_url', tempUrl);
      handleInputChange('source_type', 'upload');
    } catch (error) {
      logger.error('Error uploading image', error as Error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlInput = (url: string) => {
    handleInputChange('image_url', url);
    handleInputChange('source_type', 'url');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      file_path: formData.image_url,
      file_name: formData.title
    });
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            إضافة صورة للدرس
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات الصورة */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات الصورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان الصورة</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="أدخل عنوان الصورة"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">وصف الصورة</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="أدخل وصف للصورة"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="alt_text">النص البديل (Alt Text)</Label>
                <Input
                  id="alt_text"
                  value={formData.alt_text}
                  onChange={(e) => handleInputChange('alt_text', e.target.value)}
                  placeholder="وصف مختصر للصورة لذوي الاحتياجات الخاصة"
                />
              </div>
            </CardContent>
          </Card>

          {/* مصدر الصورة */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">مصدر الصورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* اختيار نوع المصدر */}
              <div>
                <Label>نوع المصدر</Label>
                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant={formData.source_type === 'upload' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('source_type', 'upload')}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    رفع ملف
                  </Button>
                  <Button
                    type="button"
                    variant={formData.source_type === 'url' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('source_type', 'url')}
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    رابط مباشر
                  </Button>
                </div>
              </div>

              {/* رفع ملف */}
              {formData.source_type === 'upload' && (
                <div>
                  <Label htmlFor="image-upload">رفع ملف الصورة</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    {formData.image_url ? (
                      <div className="space-y-3">
                        <img
                          src={formData.image_url}
                          alt={formData.alt_text || formData.title}
                          className="w-full max-h-48 object-contain rounded"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('image_url', '')}
                        >
                          <X className="h-4 w-4 ml-1" />
                          إزالة
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Image className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div>
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-primary hover:underline">
                              اختر ملف صورة
                            </span>
                            <span className="text-muted-foreground"> أو اسحبه هنا</span>
                          </Label>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          أنواع مدعومة: JPG, PNG, GIF, WebP
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* رابط خارجي */}
              {formData.source_type === 'url' && (
                <div>
                  <Label htmlFor="image_url">رابط الصورة</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  
                  {/* معاينة الصورة */}
                  {formData.image_url && (
                    <div className="mt-3">
                      <Label>معاينة الصورة</Label>
                      <div className="mt-2 border rounded-lg p-4">
                        <img
                          src={formData.image_url}
                          alt={formData.alt_text || formData.title}
                          className="w-full max-h-48 object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-center text-muted-foreground py-8">
                          لا يمكن تحميل الصورة. تحقق من صحة الرابط.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* أزرار التحكم */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
            <Button type="submit" disabled={!formData.title || !formData.image_url || isUploading}>
              إضافة الصورة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonImageForm;