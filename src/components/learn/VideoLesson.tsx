'use client';

interface VideoLessonProps {
  title: string;
  content: string;
  videoUrl: string;
  videoDuration: string;
  onPrevious?: () => void;
  onComplete?: () => void;
  hasPrevious?: boolean;
  isCompleted?: boolean;
}

export default function VideoLesson({ title, content, videoUrl, videoDuration }: VideoLessonProps) {
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/embed/')) return url;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return url;
  };

  return (
    <div>
      <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-3 uppercase tracking-wide">
        Video lesson
      </span>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 font-heading">{title}</h1>
      {videoDuration && <p className="text-sm text-gray-400 mb-6">Duration: {videoDuration}</p>}

      {videoUrl ? (
        <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden mb-8">
          <iframe
            src={getEmbedUrl(videoUrl)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-8">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p>Video coming soon</p>
          </div>
        </div>
      )}

      {content && (
        <div
          className="prose prose-gray max-w-none
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-4
            prose-code:text-orange-600"
          // TODO: Sanitize with DOMPurify in production
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
