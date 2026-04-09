'use client';
import { useState, useEffect } from 'react';
import { useCourseBuilder } from '@/components/course-builder/CourseBuilderLayout';
import CurriculumSidebar from '@/components/course-builder/CurriculumSidebar';
import LessonEditor from '@/components/course-builder/LessonEditor';

type LessonType = 'text' | 'video' | 'audio' | 'slides' | 'stream' | 'quiz' | 'assignment' | 'exercise';

interface LessonItem {
  id: string;
  type: LessonType;
  title: string;
  duration?: string;
  isPreview?: boolean;
  isDrip?: boolean;
}

interface Section {
  id: string;
  title: string;
  isExpanded: boolean;
  items: LessonItem[];
}

export default function CurriculumPage() {
  const { courseData } = useCourseBuilder();
  const courseSlug = courseData?.slug || '';
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<LessonType | null>(null);

  // Populate sections from course data
  useEffect(() => {
    if (!courseData) return;
    // CourseBuilderLayout already maps modules → sections
    if (courseData.sections && Array.isArray(courseData.sections) && courseData.sections.length > 0) {
      setSections(courseData.sections);
      return;
    }
    // Fallback: map modules directly
    if (courseData.modules && Array.isArray(courseData.modules) && courseData.modules.length > 0) {
      const mapped: Section[] = courseData.modules.map((mod: Record<string, unknown>, idx: number) => {
        const modTitle = typeof mod.title === 'object' && mod.title !== null
          ? (mod.title as Record<string, string>).en || Object.values(mod.title as Record<string, string>)[0] || ''
          : (mod.title as string) || '';
        const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];
        return {
          id: String(mod.id || `mod-${idx}`),
          title: modTitle,
          isExpanded: idx === 0,
          items: lessons.map((lesson: Record<string, unknown>, lIdx: number) => {
            const lessonTitle = typeof lesson.title === 'object' && lesson.title !== null
              ? (lesson.title as Record<string, string>).en || Object.values(lesson.title as Record<string, string>)[0] || ''
              : (lesson.title as string) || '';
            return {
              id: String(lesson.id || `lesson-${idx}-${lIdx}`),
              type: ((lesson.lesson_type as string) || 'text') as LessonType,
              title: lessonTitle,
              duration: (lesson.video_duration as string) || (lesson.duration ? `${lesson.duration} min` : undefined),
              isPreview: !!(lesson.is_free_preview),
            };
          }),
        };
      });
      setSections(mapped);
    }
  }, [courseData]);

  const selectedItem = sections.flatMap(s => s.items).find(i => i.id === selectedItemId);

  const handleSelectItem = (id: string, type: LessonType) => {
    setSelectedItemId(id);
    setSelectedItemType(type);
  };

  if (!courseData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <CurriculumSidebar
        courseSlug={courseSlug}
        sections={sections}
        setSections={setSections}
        selectedItemId={selectedItemId}
        onSelectItem={handleSelectItem}
      />
      <div className="flex-1 overflow-y-auto bg-white">
        <LessonEditor
          itemId={selectedItemId}
          itemType={selectedItemType}
          itemTitle={selectedItem?.title || ''}
        />
      </div>
    </div>
  );
}
