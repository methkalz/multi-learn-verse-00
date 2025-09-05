import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Code, X } from 'lucide-react';

interface LessonCodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const PROGRAMMING_LANGUAGES = [
  { value: 'cmd', label: 'Command Prompt (CMD)' },
  { value: 'bash', label: 'Bash/Terminal' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'php', label: 'PHP' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'plaintext', label: 'Plain Text' },
];

const LessonCodeForm: React.FC<LessonCodeFormProps> = ({ isOpen, onClose, onSubmit }) => {
const [formData, setFormData] = useState({
    title: '',
    code: '',
    language: 'cmd',
    enableTypewriter: true,
    typewriterSpeed: 30,
    autoRestart: true,
    loop: true,
    pauseDuration: 1000,
    showLineNumbers: true,
    theme: 'dark',
    orderIndex: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a proper file_path for code based on title
    const fileName = `${formData.title || `code-${Date.now()}`}.${formData.language}`;
    const filePath = `code/${fileName}`;
    
    const codeData = {
      file_name: formData.title || 'مثال كود',
      file_path: filePath,
      media_type: 'code',
      metadata: {
        title: formData.title,
        code: formData.code,
        language: formData.language,
        enableTypewriter: formData.enableTypewriter,
        typewriterSpeed: formData.typewriterSpeed,
        autoRestart: formData.autoRestart,
        loop: formData.loop,
        pauseDuration: formData.pauseDuration,
        showLineNumbers: formData.showLineNumbers,
        theme: formData.theme,
      },
      order_index: formData.orderIndex,
    };

    onSubmit(codeData);
    
    // Reset form
    setFormData({
      title: '',
      code: '',
      language: 'cmd',
      enableTypewriter: true,
      typewriterSpeed: 30,
      autoRestart: true,
      loop: true,
      pauseDuration: 1000,
      showLineNumbers: true,
      theme: 'dark',
      orderIndex: 0,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-500" />
            إضافة كود للدرس
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الكود</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="مثال: حلقة For في البايثون"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">لغة البرمجة</Label>
              <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر لغة البرمجة" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">الكود</Label>
            <Textarea
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="اكتب الكود هنا..."
              className="min-h-64 font-mono text-right"
              dir="ltr"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableTypewriter">تفعيل تأثير الكتابة</Label>
              <Switch
                id="enableTypewriter"
                checked={formData.enableTypewriter}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableTypewriter: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showLineNumbers">إظهار أرقام الأسطر</Label>
              <Switch
                id="showLineNumbers"
                checked={formData.showLineNumbers}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showLineNumbers: checked }))}
              />
            </div>
          </div>

          {formData.enableTypewriter && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="typewriterSpeed">سرعة تأثير الكتابة (مللي ثانية)</Label>
                <Input
                  id="typewriterSpeed"
                  type="number"
                  min="10"
                  max="1000"
                  value={formData.typewriterSpeed}
                  onChange={(e) => setFormData(prev => ({ ...prev, typewriterSpeed: parseInt(e.target.value) || 50 }))}
                  className="text-right"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoRestart">إعادة تشغيل تلقائي</Label>
                  <Switch
                    id="autoRestart"
                    checked={formData.autoRestart}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoRestart: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="loop">تكرار مستمر</Label>
                  <Switch
                    id="loop"
                    checked={formData.loop}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, loop: checked }))}
                  />
                </div>
              </div>

              {(formData.autoRestart || formData.loop) && (
                <div className="space-y-2">
                  <Label htmlFor="pauseDuration">مدة التوقف بين التكرارات (مللي ثانية)</Label>
                  <Input
                    id="pauseDuration"
                    type="number"
                    min="500"
                    max="10000"
                    value={formData.pauseDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, pauseDuration: parseInt(e.target.value) || 2000 }))}
                    className="text-right"
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="theme">نمط العرض</Label>
            <Select value={formData.theme} onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نمط العرض" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">داكن</SelectItem>
                <SelectItem value="light">فاتح</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderIndex">ترتيب العرض</Label>
            <Input
              id="orderIndex"
              type="number"
              value={formData.orderIndex}
              onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
              className="text-right"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={!formData.code.trim()}>
              حفظ الكود
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonCodeForm;