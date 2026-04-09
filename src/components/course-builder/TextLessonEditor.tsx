'use client';
import React, { useState, useCallback } from 'react';
import api from '@/lib/api';

function RichTextToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
  const [fontSize, setFontSize] = useState(16);

  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }, [editorRef]);

  const changeFontSize = useCallback((delta: number) => {
    const newSize = Math.max(8, Math.min(72, fontSize + delta));
    setFontSize(newSize);
    editorRef.current?.focus();
    document.execCommand('fontSize', false, '7');
    // Replace the font size 7 spans with actual px size
    const el = editorRef.current;
    if (el) {
      const fonts = el.querySelectorAll('font[size="7"]');
      fonts.forEach(f => {
        const span = document.createElement('span');
        span.style.fontSize = `${newSize}px`;
        span.innerHTML = f.innerHTML;
        f.replaceWith(span);
      });
    }
  }, [editorRef, fontSize]);

  const setDirection = useCallback((dir: 'ltr' | 'rtl') => {
    if (editorRef.current) {
      editorRef.current.dir = dir;
      editorRef.current.style.direction = dir;
      editorRef.current.focus();
    }
  }, [editorRef]);

  return (
    <div className="border-b bg-gray-50">
      {/* Menu bar */}
      <div className="flex gap-4 px-3 py-1.5 border-b text-xs text-gray-600">
        {['View', 'Format', 'Table', 'Tools'].map(item => (
          <button key={item} className="hover:text-gray-900 cursor-pointer">{item}</button>
        ))}
      </div>
      {/* Row 1: Undo/Redo + Block + Font + Size + Bold/Italic */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b flex-wrap">
        <button className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Undo" onClick={() => exec('undo')}>↩</button>
        <button className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Redo" onClick={() => exec('redo')}>↪</button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <select className="text-xs border rounded px-2 py-1 bg-white text-gray-700 cursor-pointer" onChange={e => {
          const val = e.target.value;
          if (val === 'Paragraph') exec('formatBlock', 'p');
          else if (val === 'Heading 1') exec('formatBlock', 'h1');
          else if (val === 'Heading 2') exec('formatBlock', 'h2');
          else if (val === 'Heading 3') exec('formatBlock', 'h3');
          else if (val === 'Heading 4') exec('formatBlock', 'h4');
          else if (val === 'Preformatted') exec('formatBlock', 'pre');
        }}>
          <option>Paragraph</option>
          <option>Heading 1</option>
          <option>Heading 2</option>
          <option>Heading 3</option>
          <option>Heading 4</option>
          <option>Preformatted</option>
        </select>
        <select className="text-xs border rounded px-2 py-1 bg-white text-gray-700 cursor-pointer ml-1" onChange={e => exec('fontName', e.target.value)}>
          <option>System Font</option>
          <option>Arial</option>
          <option>Times New Roman</option>
          <option>Courier New</option>
          <option>Georgia</option>
        </select>
        <div className="flex items-center gap-0.5 ml-1">
          <button className="p-1 hover:bg-gray-200 rounded text-gray-500 text-xs" onClick={() => changeFontSize(-2)}>−</button>
          <span className="text-xs text-gray-600 px-1 border rounded bg-white min-w-[40px] text-center py-0.5">{fontSize}px</span>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-500 text-xs" onClick={() => changeFontSize(2)}>+</button>
        </div>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button className="p-1.5 hover:bg-gray-200 rounded font-bold text-sm" title="Bold" onClick={() => exec('bold')}>B</button>
        <button className="p-1.5 hover:bg-gray-200 rounded italic text-sm" title="Italic" onClick={() => exec('italic')}>I</button>
      </div>
      {/* Row 2: Formatting buttons */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b flex-wrap">
        <button className="p-1.5 hover:bg-gray-200 rounded text-sm underline" title="Underline" onClick={() => exec('underline')}>U</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-sm line-through" title="Strikethrough" onClick={() => exec('strikeThrough')}>S</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-sm" title="Text color" onClick={() => exec('foreColor', '#ef4444')}>
          <span className="border-b-2 border-red-500">A</span>
        </button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-sm" title="Highlight" onClick={() => exec('hiliteColor', '#fef08a')}>
          <span className="bg-yellow-200 px-0.5">A</span>
        </button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Insert link" onClick={() => { const url = prompt('Enter URL:'); if (url) exec('createLink', url); }}>🔗</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Insert image" onClick={() => { const url = prompt('Enter image URL:'); if (url) exec('insertImage', url); }}>🖼️</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Insert media">▶️</button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Align left" onClick={() => exec('justifyLeft')}>≡</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Align center" onClick={() => exec('justifyCenter')}>≡</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Align right" onClick={() => exec('justifyRight')}>≡</button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Line height">↕</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Bullet list" onClick={() => exec('insertUnorderedList')}>•≡</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Numbered list" onClick={() => exec('insertOrderedList')}>1≡</button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Subscript" onClick={() => exec('subscript')}>X₂</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Superscript" onClick={() => exec('superscript')}>X²</button>
      </div>
      {/* Row 3: Additional */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 flex-wrap">
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Indent" onClick={() => exec('indent')}>→≡</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Outdent" onClick={() => exec('outdent')}>←≡</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Clear formatting" onClick={() => exec('removeFormat')}>✕</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Fullscreen">⛶</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="LTR" onClick={() => setDirection('ltr')}>LTR</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="RTL" onClick={() => setDirection('rtl')}>RTL</button>
        <button className="p-1.5 hover:bg-gray-200 rounded text-xs" title="Source code">&lt;/&gt;</button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button className="px-2 py-1 hover:bg-gray-200 rounded text-xs font-medium text-gray-600 flex items-center gap-1 border border-gray-300" title="Insert code block" onClick={() => exec('formatBlock', 'pre')}>
          <span className="text-[10px]">{'{ }'}</span> Code Block
        </button>
      </div>
    </div>
  );
}

function RichTextEditor({ value, onChange, minHeight = '200px', placeholder = '' }: {
  value: string;
  onChange: (v: string) => void;
  minHeight?: string;
  placeholder?: string;
}) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = React.useState(0);

  // Only set initial content, don't re-render on every keystroke
  React.useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerText.trim()) {
      editorRef.current.innerText = value;
      setWordCount(value.split(/\s+/).filter(Boolean).length);
    }
  }, [value]);

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <RichTextToolbar editorRef={editorRef} />
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dir="ltr"
          className="p-4 focus:outline-none text-sm text-gray-800 leading-relaxed"
          style={{ minHeight, direction: 'ltr' }}
          onInput={e => {
            const text = (e.target as HTMLDivElement).innerText;
            onChange(text);
            setWordCount(text.split(/\s+/).filter(Boolean).length);
          }}
          data-placeholder={placeholder}
        />
        {/* Placeholder */}
        {wordCount === 0 && !value && (
          <div className="absolute top-4 left-4 text-sm text-gray-400 pointer-events-none">{placeholder}</div>
        )}
        <div className="flex items-center justify-between px-3 py-1 border-t bg-gray-50 text-xs text-gray-400">
          <span>p</span>
          <span>{wordCount} words</span>
        </div>
      </div>
    </div>
  );
}

export { RichTextEditor, RichTextToolbar };

interface TextLessonProps {
  title: string;
  courseSlug?: string;
  moduleId?: string;
  lessonId?: string;
  onTitleChange?: (t: string) => void;
}

export default function TextLessonEditor({ title: initialTitle, courseSlug, moduleId, lessonId, onTitleChange }: TextLessonProps) {
  const [title, setTitle] = useState(initialTitle);
  const [activeTab, setActiveTab] = useState<'lesson' | 'qa'>('lesson');
  const [duration, setDuration] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isDrip, setIsDrip] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    const mid = parseInt(moduleId || '');
    const lid = parseInt(lessonId || '');
    if (!courseSlug || !mid || !lid || isNaN(mid) || isNaN(lid)) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      await api.updateLesson(courseSlug, mid, lid, {
        title: { en: title },
        content: { en: lessonContent },
        duration: parseInt(duration) || 0,
        is_free_preview: isPreview,
      });
      setSaveStatus('saved');
      onTitleChange?.(title);
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 w-[70%] mx-auto">
      {/* Type Badge + Title + Save */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap flex items-center gap-1.5">
            📄 Text lesson
          </span>
          <input
            className="flex-1 text-lg font-heading font-semibold border border-gray-200 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none bg-white"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter lesson name"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`ml-4 px-6 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
            saveStatus === 'saved' ? 'bg-green-500 text-white' :
            saveStatus === 'error' ? 'bg-red-500 text-white' :
            'bg-orange-500 text-white hover:bg-orange-600'
          } disabled:opacity-50`}
        >
          {saving ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? '✗ Error' : 'Save'}
        </button>
      </div>

      {/* Tabs: Lesson | Q&A */}
      <div className="flex mb-6">
        {(['lesson', 'qa'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium text-center transition border-b-2 cursor-pointer ${
              activeTab === tab
                ? 'border-orange-500 text-orange-600 bg-orange-50'
                : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab === 'lesson' ? 'Lesson' : 'Q&A'}
          </button>
        ))}
      </div>

      {activeTab === 'lesson' ? (
        <div className="space-y-6">
          {/* Lesson duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson duration</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="Example: 2h 45m"
            />
          </div>

          {/* Lesson preview toggle */}
          <div className="flex items-center justify-between py-3 border-t border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Lesson preview</span>
              <span className="text-gray-400 cursor-help" title="Allow students to preview this lesson before enrolling">ⓘ</span>
            </div>
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`relative w-11 h-6 rounded-full transition cursor-pointer ${isPreview ? 'bg-orange-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${isPreview ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Drip toggle */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-700">Unlock the lesson after a certain time after the purchase</span>
            <button
              onClick={() => setIsDrip(!isDrip)}
              className={`relative w-11 h-6 rounded-full transition cursor-pointer ${isDrip ? 'bg-orange-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${isDrip ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Start date & time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson start date</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson start time</label>
              <div className="relative">
                <input
                  type="time"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Short description - Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Short description of the lesson</label>
            <RichTextEditor
              value={shortDescription}
              onChange={setShortDescription}
              minHeight="120px"
              placeholder="Enter a brief summary of this lesson..."
            />
          </div>

          {/* Lesson content - Rich Text Editor (larger) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson content</label>
            <RichTextEditor
              value={lessonContent}
              onChange={setLessonContent}
              minHeight="400px"
              placeholder="Write your full lesson content here..."
            />
          </div>

          {/* Save button at bottom */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-8 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                saveStatus === 'saved' ? 'bg-green-500 text-white' :
                saveStatus === 'error' ? 'bg-red-500 text-white' :
                'bg-orange-500 text-white hover:bg-orange-600'
              } disabled:opacity-50`}
            >
              {saving ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? '✗ Error' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">💬</p>
          <p className="text-sm font-medium text-gray-500 mb-1">No questions yet</p>
          <p className="text-xs">Q&A will appear here once students start asking questions about this lesson.</p>
        </div>
      )}
    </div>
  );
}
