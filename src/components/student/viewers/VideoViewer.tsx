import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VideoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    description?: string;
    video_url: string;
    duration?: number;
  };
  onProgress: (progress: number, watchTime: number) => void;
  onComplete: () => void;
}

export const VideoViewer: React.FC<VideoViewerProps> = ({ 
  isOpen, 
  onClose, 
  video, 
  onProgress,
  onComplete 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const progressUpdateRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen && !hasStarted) {
      setHasStarted(true);
      toast.info('بدأت مشاهدة الفيديو', {
        description: 'ستحصل على النقاط عند إكمال المشاهدة'
      });
    }
  }, [isOpen, hasStarted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      
      if (duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        setProgress(progressPercent);
        setWatchTime(currentTime);

        // Update progress every 5 seconds
        if (progressUpdateRef.current) {
          clearTimeout(progressUpdateRef.current);
        }
        
        progressUpdateRef.current = setTimeout(() => {
          onProgress(progressPercent, currentTime);
        }, 5000);

        // Mark as complete if watched 90% or more
        if (progressPercent >= 90 && !isCompleted) {
          setIsCompleted(true);
          onComplete();
          toast.success('تم إكمال الفيديو بنجاح!', {
            description: 'تم إضافة النقاط إلى رصيدك'
          });
        }
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current);
      }
    };
  }, [onProgress, onComplete, isCompleted]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleClose = () => {
    // Save final progress before closing
    if (progress > 0) {
      onProgress(progress, watchTime);
    }
    onClose();
  };

  const getVideoUrl = (url: string) => {
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop()?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // Direct video URLs
    return url;
  };

  const isEmbedded = video.video_url.includes('youtube.com') || 
                    video.video_url.includes('youtu.be') || 
                    video.video_url.includes('vimeo.com');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <DialogTitle className="text-xl font-bold">{video.title}</DialogTitle>
              {video.description && (
                <p className="text-sm text-muted-foreground">{video.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  مكتمل
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {isEmbedded ? (
              <iframe
                src={getVideoUrl(video.video_url)}
                className="w-full aspect-video"
                allowFullScreen
                title={video.title}
              />
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={video.video_url}
                  className="w-full aspect-video"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Custom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    
                    <div className="flex-1 text-white text-sm">
                      {Math.floor(watchTime / 60)}:{Math.floor(watchTime % 60).toString().padStart(2, '0')}
                      {video.duration && ` / ${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}`}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">تقدم المشاهدة</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose}>
              إغلاق
            </Button>
            {isCompleted && (
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                مكتمل
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};