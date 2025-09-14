import React, { useState } from 'react';
import { Video, Play, Search, Calendar, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Grade10Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  source_type: 'youtube' | 'vimeo' | 'direct';
  category?: string;
  grade_level: string;
  owner_user_id: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
}

interface Grade10VideoViewerProps {
  videos: Grade10Video[];
  loading: boolean;
}

const Grade10VideoViewer: React.FC<Grade10VideoViewerProps> = ({ videos, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getVideoThumbnail = (video: Grade10Video): string => {
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }

    if (video.source_type === 'youtube') {
      const videoId = extractYouTubeId(video.video_url);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }

    return '/placeholder.svg';
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const openVideo = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSourceTypeLabel = (sourceType: string): string => {
    const labels = {
      youtube: 'يوتيوب',
      vimeo: 'فيميو',
      direct: 'رابط مباشر',
      embedded: 'مدمج'
    };
    return labels[sourceType as keyof typeof labels] || sourceType;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">فيديوهات الصف العاشر</h2>
          <p className="text-muted-foreground">
            {filteredVideos.length} من {videos.length} فيديو
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في الفيديوهات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'لا توجد نتائج' : 'لا توجد فيديوهات'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'جرب البحث بمصطلحات مختلفة'
              : 'لم يتم إضافة أي فيديوهات للصف العاشر بعد'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={getVideoThumbnail(video)}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/50"
                    onClick={() => openVideo(video.video_url)}
                  >
                    <Play className="h-6 w-6 mr-2" />
                    مشاهدة
                  </Button>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-7 line-clamp-2">
                  {video.title}
                </CardTitle>
                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getSourceTypeLabel(video.source_type)}
                  </Badge>
                  {video.category && (
                    <Badge variant="outline" className="text-xs">
                      {video.category}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(video.created_at)}
                  </div>
                  {video.duration && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {video.duration}
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => openVideo(video.video_url)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  مشاهدة الفيديو
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Grade10VideoViewer;