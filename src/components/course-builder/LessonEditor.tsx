'use client';
type LessonType = 'text' | 'video' | 'audio' | 'slides' | 'stream' | 'quiz' | 'assignment' | 'exercise';
import TextLessonEditor from './TextLessonEditor';
import VideoLessonEditor from './VideoLessonEditor';
import QuizEditor from './QuizEditor';
import AssignmentEditor from './AssignmentEditor';
import ExerciseEditor from './ExerciseEditor';
import AudioLessonEditor from './AudioLessonEditor';

interface Props {
  itemId: string | null;
  itemType: LessonType | null;
  itemTitle: string;
  courseSlug?: string;
  moduleId?: string | null;
  onTitleChange?: (title: string) => void;
}

function GenericLessonEditor({ title: initialTitle, type, sourceLabel, placeholder, courseSlug, moduleId, lessonId, onTitleChange }: { title: string; type: string; sourceLabel: string; placeholder: string; courseSlug?: string; moduleId?: string; lessonId?: string; onTitleChange?: (t: string) => void }) {
  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          type === 'audio' ? 'bg-green-100 text-green-700' : type === 'slides' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
        }`}>{type.toUpperCase()} LESSON</span>
      </div>
      <input className="w-full text-2xl font-heading font-semibold border-0 border-b-2 border-gray-200 focus:border-orange-500 focus:outline-none pb-2 mb-6 bg-transparent" defaultValue={initialTitle} />
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{sourceLabel}</label>
          <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder={placeholder} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Duration (minutes)</label>
          <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm max-w-32" defaultValue="10" />
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-3xl mb-2">📁</p>
          <p className="text-sm text-gray-500">Drag & drop file or click to browse</p>
          <button className="mt-3 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Choose File</button>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <textarea className="w-full px-3 py-2 border rounded-lg text-sm min-h-[120px]" placeholder="Lesson description..." />
        </div>
        <button className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">Save Lesson</button>
      </div>
    </div>
  );
}

export default function LessonEditor({ itemId, itemType, itemTitle, courseSlug, moduleId, onTitleChange }: Props) {
  if (!itemId || !itemType) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <p className="text-6xl mb-4">📚</p>
          <h3 className="text-xl font-heading font-semibold text-gray-700 mb-2">Let&apos;s build your course!</h3>
          <p className="text-sm text-gray-400 mb-6">Select a lesson from the curriculum to start editing</p>
          <button className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition cursor-pointer inline-flex items-center gap-2">
            <span className="text-lg">＋</span> Add New Lesson
          </button>
        </div>
      </div>
    );
  }

  const saveProps = { courseSlug: courseSlug || '', moduleId: moduleId || '', lessonId: itemId || '', onTitleChange };
  switch (itemType) {
    case 'text': return <TextLessonEditor title={itemTitle} {...saveProps} />;
    case 'video': return <VideoLessonEditor title={itemTitle} {...saveProps} />;
    case 'quiz': return <QuizEditor title={itemTitle} courseSlug={courseSlug} moduleId={moduleId || ''} lessonId={itemId || ''} onTitleChange={onTitleChange} />;
    case 'assignment': return <AssignmentEditor title={itemTitle} />;
    case 'audio': return <AudioLessonEditor title={itemTitle} {...saveProps} />;
    case 'slides': return <GenericLessonEditor title={itemTitle} type="slides" sourceLabel="Slides URL" placeholder="Enter Google Slides or PDF URL..." {...saveProps} />;
    case 'stream': return <GenericLessonEditor title={itemTitle} type="stream" sourceLabel="Stream URL" placeholder="Enter live stream URL..." {...saveProps} />;
    case 'exercise': return <ExerciseEditor title={itemTitle} />;
    default: return null;
  }
}
