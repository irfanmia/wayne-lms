'use client';
import { useState, useEffect } from 'react';
import { useCourseBuilder } from './CourseBuilderLayout';
import api from '@/lib/api';
import EmojiPicker from '@/components/admin/EmojiPicker';

const settingsSections = ['Main', 'Access', 'Prerequisites', 'Course Files', 'Certificate', 'Course Page'] as const;
const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

type CategoryItem = { id: number; name: string; slug: string; parent: number | null; subcategories: CategoryItem[] };
// prereqCoursesList populated from API in useEffect below
const certificateTemplates = [
  { id: 'default', name: 'Default System', color: 'bg-gray-100' },
  { id: 'blue', name: 'Professional Blue', color: 'bg-blue-100' },
  { id: 'gold', name: 'Elegant Gold', color: 'bg-yellow-100' },
  { id: 'minimal', name: 'Modern Minimal', color: 'bg-white' },
  { id: 'academic', name: 'Academic Classic', color: 'bg-emerald-50' },
  { id: 'orange', name: 'Creative Orange', color: 'bg-orange-100' },
];
const layoutTemplates = [
  { id: 'default', name: 'Default', color: 'bg-gradient-to-b from-orange-100 to-white' },
  { id: 'classic', name: 'Classic', color: 'bg-gradient-to-b from-blue-100 to-white' },
  { id: 'industrial', name: 'Industrial', color: 'bg-gradient-to-b from-gray-200 to-gray-50' },
];
const deviceTypes = ['Desktop', 'Tablet', 'Mobile', 'Smart TV'];

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div className={`relative w-10 h-5 rounded-full transition ${checked ? 'bg-orange-500' : 'bg-gray-300'}`} onClick={() => onChange(!checked)}>
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300';
const inputErrorCls = 'w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-red-50';

export default function SettingsEditor() {
  const { isNewCourse, isSaved, courseName: ctxName, setCourseName: setCtxName, setCourseCategory: setCtxCategory, courseData, markSaved } = useCourseBuilder();

  const [activeSection, setActiveSection] = useState<string>('Main');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* Categories */
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subCategoryId, setSubCategoryId] = useState<number | ''>('');
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [showNewSubCatModal, setShowNewSubCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [newSubCatName, setNewSubCatName] = useState('');
  const [newSubCatIcon, setNewSubCatIcon] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      const list = res.results || res;
      if (Array.isArray(list)) {
        // Normalise: ensure subcategories is always an array
        const normalised = (list as CategoryItem[]).map(c => ({
          ...c,
          subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
        }));
        setAllCategories(normalised);
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const selectedCategory = allCategories.find(c => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setCatSaving(true);
    try {
      const res = await api.createCategory({ name: newCatName.trim(), icon: newCatIcon });
      await fetchCategories();
      setCategoryId(res.id);
      setSubCategoryId('');
      setNewCatName('');
      setNewCatIcon('');
      setShowNewCatModal(false);
    } catch { /* ignore */ } finally { setCatSaving(false); }
  };

  const handleCreateSubCategory = async () => {
    if (!newSubCatName.trim() || !categoryId) return;
    setCatSaving(true);
    try {
      const res = await api.createCategory({ name: newSubCatName.trim(), icon: newSubCatIcon, parent: categoryId });
      await fetchCategories();
      setSubCategoryId(res.id);
      setNewSubCatName('');
      setNewSubCatIcon('');
      setShowNewSubCatModal(false);
    } catch { /* ignore */ } finally { setCatSaving(false); }
  };

  /* Main */
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [instructor, setInstructor] = useState('');
  const [description, setDescription] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [previewDesc, setPreviewDesc] = useState('');
  const [featured, setFeatured] = useState(false);
  const [lockOrder, setLockOrder] = useState(true);
  const [accessDuration, setAccessDuration] = useState('Lifetime');
  const [accessDevices, setAccessDevices] = useState<string[]>(['Desktop', 'Tablet', 'Mobile']);
  const [certInfo, setCertInfo] = useState('');

  /* Access */
  const [access, setAccess] = useState('enrolled');
  const [trialCourse, setTrialCourse] = useState(false);
  const [timeLimit, setTimeLimit] = useState(false);
  const [timeLimitValue, setTimeLimitValue] = useState('30');
  const [timeLimitUnit, setTimeLimitUnit] = useState('days');

  /* Prerequisites */
  const [prereqPercent, setPrereqPercent] = useState('80');
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>([]);
  const [prereqSearch, setPrereqSearch] = useState('');
  const [allCourses, setAllCourses] = useState<{slug: string; title: string}[]>([]);

  /* Course Files */
  const [courseImage, setCourseImage] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [courseFiles, setCourseFiles] = useState<{ name: string; size: string; url?: string }[]>([]);
  const [filesUploading, setFilesUploading] = useState(false);

  /* Certificate */
  const [certificate, setCertificate] = useState(false);
  const [selectedCertTemplate, setSelectedCertTemplate] = useState('default');

  // Populate from API course data
  useEffect(() => {
    if (!courseData || isNewCourse) return;
    setName(courseData.title || '');
    setSlug(courseData.slug || '');
    // category_fk is an id (number), category is a plain string fallback
    if (courseData.category_fk) {
      setCategoryId(Number(courseData.category_fk));
    } else if (courseData.category?.id) {
      setCategoryId(courseData.category.id);
    }
    setCategory(courseData.category?.name || (typeof courseData.category === 'string' ? courseData.category : '') || '');
    if (courseData.sub_category_fk) {
      setSubCategoryId(Number(courseData.sub_category_fk));
    } else if (courseData.sub_category?.id) {
      setSubCategoryId(courseData.sub_category.id);
    }
    setLevel(courseData.level || 'Beginner');
    setInstructor(courseData.instructor || '');
    setDescription(courseData.description || '');
    setCourseDuration(courseData.duration || '');
    setCourseImage(courseData.thumbnail || '');
    if (courseData.settings) {
      setAccess(courseData.settings.access || 'enrolled');
      setSelectedPrereqs(courseData.settings.prerequisites || []);
      setCertificate(courseData.settings.certificate || false);
    }
  }, [courseData, isNewCourse]);

  /* Course Page */
  const [selectedLayout, setSelectedLayout] = useState('default');

  // Auto-generate slug from name
  useEffect(() => {
    if (isNewCourse || !isSaved) {
      const generated = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  }, [name, isNewCourse, isSaved]);

  // Sync name/category to layout context
  useEffect(() => {
    setCtxName(name);
  }, [name, setCtxName]);
  useEffect(() => {
    const catName = allCategories.find(c => c.id === categoryId)?.name || category || '';
    setCtxCategory(catName);
  }, [categoryId, category, allCategories, setCtxCategory]);

  // Fetch all courses for prerequisites search
  useEffect(() => {
    api.getCourses().then(res => {
      const list = res.results || res;
      if (Array.isArray(list)) {
        setAllCourses(list.map((c: Record<string, unknown>) => ({
          slug: (c.slug as string) || '',
          title: typeof c.title === 'object' && c.title !== null
            ? ((c.title as Record<string, string>).en || Object.values(c.title as Record<string, string>)[0] || '')
            : (c.title as string) || '',
        })).filter(c => c.slug !== courseData?.slug)); // Exclude current course
      }
    }).catch(() => {});
  }, [courseData?.slug]);

  const filteredCourses = allCourses
    .filter(c => c.title.toLowerCase().includes(prereqSearch.toLowerCase()) && !selectedPrereqs.includes(c.slug));

  const toggleDevice = (d: string) => {
    setAccessDevices(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const validateAndSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Course name is required';
    if (!categoryId) newErrors.category = 'Category is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      // Scroll to top to show errors
      return;
    }

    // Save the course via API
    const generatedSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = {
      title: { en: name.trim(), ar: '', es: '' },
      category_id: categoryId || null,
      sub_category_id: subCategoryId || null,
      level: level.toLowerCase(),
      description: { en: description.trim() || name.trim(), ar: '', es: '' },
      is_featured: featured,
      thumbnail: courseImage || '',
      status: 'draft',
    };
    try {
      if (isNewCourse) {
        const result = await api.createCourse(payload as Record<string, unknown>);
        markSaved();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        if (result?.slug) {
          setTimeout(() => {
            window.location.href = `/admin/courses/${result.slug}/edit/settings`;
          }, 1500);
        }
      } else {
        const slug = courseData?.slug || generatedSlug;
        await api.updateCourse(slug, payload as Record<string, unknown>);
        // Save prerequisites separately
        if (selectedPrereqs.length > 0 || (courseData?.settings?.prerequisites?.length > 0)) {
          try {
            await api.put(`/courses/${slug}/prerequisites/`, { prerequisite_slugs: selectedPrereqs });
          } catch { /* ignore if prereq save fails */ }
        }
        markSaved();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save course';
      setErrors({ save: message });
    }
  };

  // For new unsaved courses, only show Main section (with mandatory fields highlighted)
  const availableSections: readonly string[] = (!isSaved && isNewCourse) ? ['Main'] : settingsSections;

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 bg-white border-r p-4 space-y-1">
        {(settingsSections as readonly string[]).map(s => {
          const disabled = !availableSections.includes(s);
          return (
            <button
              key={s}
              onClick={() => !disabled && setActiveSection(s)}
              disabled={disabled}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : activeSection === s
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
              {disabled && <span className="ml-1 text-[10px]">🔒</span>}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto"><div className="w-[70%] mx-auto">

        {/* Top Save Button */}
        <div className="mb-6 flex justify-end">
          <button onClick={validateAndSave} className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition cursor-pointer shadow-md">
            {isNewCourse && !isSaved ? '💾 Save & Create Course' : '💾 Save Settings'}
          </button>
        </div>

        {/* Error banner */}
        {errors.save && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
            <span>❌</span>
            {errors.save}
          </div>
        )}

        {/* Success banner */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
            <span>✅</span>
            {isNewCourse && !isSaved ? 'Course created! You can now add curriculum and other content.' : 'Settings saved successfully!'}
          </div>
        )}

        {/* New course banner */}
        {isNewCourse && !isSaved && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span>ℹ️</span>
            <span>Fill in the <strong>Course Name</strong> and <strong>Category</strong>, then click <strong>Save &amp; Create Course</strong> to unlock all tabs.</span>
          </div>
        )}

        {activeSection === 'Main' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-heading">Main Settings</h3>

            <Field label="Course Name" required>
              <input
                className={errors.name ? inputErrorCls : inputCls}
                value={name}
                onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                placeholder="e.g. Introduction to Python Programming"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </Field>

            <Field label="Slug">
              <input className={`${inputCls} bg-gray-50 text-gray-500`} value={slug} onChange={e => setSlug(e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" required>
                <div className="flex gap-2">
                  <select
                    className={`flex-1 ${errors.category ? inputErrorCls : inputCls}`}
                    value={categoryId}
                    onChange={e => {
                      setCategoryId(e.target.value ? Number(e.target.value) : '');
                      setSubCategoryId('');
                      setErrors(prev => ({ ...prev, category: '' }));
                    }}
                  >
                    <option value="">Select a category...</option>
                    {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCatModal(true)}
                    className="px-3 py-2 text-sm bg-orange-50 border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-100 transition whitespace-nowrap cursor-pointer"
                    title="Create new category"
                  >+ New</button>
                </div>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </Field>
              <Field label="Level">
                <select className={inputCls} value={level} onChange={e => setLevel(e.target.value)}>
                  {levels.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
            </div>

            {/* Sub-category row */}
            <Field label="Sub-category (optional)">
              <div className="flex gap-2">
                <select
                  className={`flex-1 ${inputCls} ${!categoryId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={subCategoryId}
                  onChange={e => setSubCategoryId(e.target.value ? Number(e.target.value) : '')}
                  disabled={!categoryId}
                >
                  <option value="">{categoryId ? 'No sub-category' : 'Select a category first'}</option>
                  {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewSubCatModal(true)}
                  disabled={!categoryId}
                  className={`px-3 py-2 text-sm border rounded-lg transition whitespace-nowrap cursor-pointer ${
                    categoryId
                      ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                      : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                  }`}
                  title="Create new sub-category"
                >+ New</button>
              </div>
            </Field>

            {/* Create Category Modal */}
            {showNewCatModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNewCatModal(false)}>
                <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h4 className="text-base font-semibold mb-4">Create New Category</h4>
                  <div className="space-y-3">
                    <input
                      className={inputCls}
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      placeholder="Category name"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                    />
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Icon (optional)</label>
                      <EmojiPicker value={newCatIcon} onChange={setNewCatIcon} placeholder="Pick an icon…" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 justify-end">
                    <button onClick={() => setShowNewCatModal(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
                    <button
                      onClick={handleCreateCategory}
                      disabled={catSaving || !newCatName.trim()}
                      className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
                    >{catSaving ? 'Creating...' : 'Create'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Sub-category Modal */}
            {showNewSubCatModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNewSubCatModal(false)}>
                <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h4 className="text-base font-semibold mb-1">Create New Sub-category</h4>
                  <p className="text-xs text-gray-400 mb-4">Under: <strong>{selectedCategory?.name}</strong></p>
                  <div className="space-y-3">
                    <input
                      className={inputCls}
                      value={newSubCatName}
                      onChange={e => setNewSubCatName(e.target.value)}
                      placeholder="Sub-category name"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleCreateSubCategory()}
                    />
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Icon (optional)</label>
                      <EmojiPicker value={newSubCatIcon} onChange={setNewSubCatIcon} placeholder="Pick an icon…" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 justify-end">
                    <button onClick={() => setShowNewSubCatModal(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
                    <button
                      onClick={handleCreateSubCategory}
                      disabled={catSaving || !newSubCatName.trim()}
                      className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
                    >{catSaving ? 'Creating...' : 'Create'}</button>
                  </div>
                </div>
              </div>
            )}

            <Field label="Instructor"><input className={inputCls} value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="Instructor name" /></Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Course Duration"><input className={inputCls} value={courseDuration} onChange={e => setCourseDuration(e.target.value)} placeholder="e.g. 9 hours" /></Field>
              <Field label="Video Duration"><input className={inputCls} value={videoDuration} onChange={e => setVideoDuration(e.target.value)} placeholder="e.g. 7.5 hours" /></Field>
            </div>

            <Field label="Course Image">
              {courseImage ? (
                <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img src={courseImage} alt="Course" className="w-full h-48 object-cover" />
                  <button onClick={() => setCourseImage('')} className="absolute top-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-50 hover:text-red-500 transition cursor-pointer">✕</button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-300 transition cursor-pointer block">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImageUploading(true);
                    try {
                      const res = await api.uploadMedia(file, 'course-images');
                      setCourseImage(res.file);
                    } catch (err) {
                      setErrors({ save: 'Image upload failed' });
                    } finally {
                      setImageUploading(false);
                    }
                  }} />
                  {imageUploading ? (
                    <p className="text-sm text-orange-500">Uploading...</p>
                  ) : (
                    <>
                      <p className="text-2xl mb-1">🖼️</p>
                      <p className="text-xs text-gray-400">Drag & drop or click to upload</p>
                    </>
                  )}
                </label>
              )}
            </Field>

            <Field label="Description">
              <textarea className={`${inputCls} min-h-[120px]`} value={description} onChange={e => setDescription(e.target.value)} placeholder="Full course description..." />
            </Field>

            <Field label="Course Preview Description">
              <textarea className={`${inputCls} min-h-[80px]`} value={previewDesc} onChange={e => setPreviewDesc(e.target.value)} placeholder="Short description shown on course cards and previews..." />
            </Field>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="accent-orange-500 w-4 h-4" checked={featured} onChange={e => setFeatured(e.target.checked)} />
                <span className="text-sm">⭐ Featured course</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="accent-orange-500 w-4 h-4" checked={lockOrder} onChange={e => setLockOrder(e.target.checked)} />
                <span className="text-sm">🔒 Lock lessons in order (sequential progress)</span>
              </label>
            </div>

            {/* What You'll Learn & Who Should Take */}
            <div className="mt-6 space-y-4">
              <Field label="What you'll learn">
                <textarea
                  className={`${inputCls} min-h-[100px]`}
                  placeholder={"Enter one item per line, e.g.:\nWrite clean HTML5 markup\nBuild responsive layouts\nCreate accessible web pages"}
                  rows={5}
                />
                <p className="text-xs text-gray-400 mt-1">One item per line. Shown as checkmark list on course page.</p>
              </Field>
              <Field label="Who should take this course">
                <textarea
                  className={`${inputCls} min-h-[100px]`}
                  placeholder={"Enter one item per line, e.g.:\nComplete beginners with no coding experience\nDesigners who want to learn development\nStudents starting a web career"}
                  rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">One item per line. Shown as bullet list on course page.</p>
              </Field>
            </div>

            {/* Additional Information */}
            <div className="mt-6 p-5 bg-gray-50 rounded-xl space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">Additional Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Access Duration"><input className={inputCls} value={accessDuration} onChange={e => setAccessDuration(e.target.value)} placeholder="e.g. Lifetime, 1 Year" /></Field>
                <Field label="Certificate Info"><input className={inputCls} value={certInfo} onChange={e => setCertInfo(e.target.value)} placeholder="e.g. Certificate of Completion" /></Field>
              </div>
              <Field label="Access Device Types">
                <div className="flex gap-3 flex-wrap">
                  {deviceTypes.map(d => (
                    <button key={d} onClick={() => toggleDevice(d)} className={`px-3 py-1.5 rounded-lg text-sm border transition ${accessDevices.includes(d) ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{d}</button>
                  ))}
                </div>
              </Field>
            </div>

          </div>
        )}

        {activeSection === 'Access' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold font-heading">Access Settings</h3>
            {['open', 'logged-in', 'enrolled'].map(opt => (
              <label key={opt} className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition ${access === opt ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="access" className="accent-orange-500" checked={access === opt} onChange={() => setAccess(opt)} />
                <div>
                  <p className="text-sm font-medium capitalize">{opt === 'logged-in' ? 'Logged-in Users' : opt === 'enrolled' ? 'Enrolled Students Only' : 'Open Access'}</p>
                  <p className="text-xs text-gray-400">{opt === 'open' ? 'Anyone can view' : opt === 'logged-in' ? 'Must be logged in' : 'Must be enrolled'}</p>
                </div>
              </label>
            ))}

            <div className="border-t pt-5 space-y-4">
              <Toggle checked={trialCourse} onChange={setTrialCourse} label="Trial course (allow limited free access)" />
              <Toggle checked={timeLimit} onChange={setTimeLimit} label="Time limit for course access" />
              {timeLimit && (
                <div className="flex gap-3 pl-6 items-end">
                  <Field label="Duration">
                    <input type="number" className={inputCls} value={timeLimitValue} onChange={e => setTimeLimitValue(e.target.value)} />
                  </Field>
                  <Field label="Unit">
                    <select className={inputCls} value={timeLimitUnit} onChange={e => setTimeLimitUnit(e.target.value)}>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </Field>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'Prerequisites' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-heading">Prerequisites</h3>
            <p className="text-sm text-gray-400">Courses that should be completed before this one.</p>

            <Field label="Prerequisite Passing Percent (%)">
              <input type="number" className={inputCls} value={prereqPercent} onChange={e => setPrereqPercent(e.target.value)} min="0" max="100" />
            </Field>

            <Field label="Search Courses">
              <div className="relative">
                <input className={inputCls} value={prereqSearch} onChange={e => setPrereqSearch(e.target.value)} placeholder="Type to search courses..." />
                {prereqSearch && filteredCourses.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredCourses.map(c => (
                      <button key={c.slug} onClick={() => { setSelectedPrereqs(prev => [...prev, c.slug]); setPrereqSearch(''); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition">{c.title}</button>
                    ))}
                  </div>
                )}
                {prereqSearch && filteredCourses.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 px-4 py-3 text-sm text-gray-400">No courses found</div>
                )}
              </div>
            </Field>

            <div className="space-y-2">
              {selectedPrereqs.map(slug => {
                const course = allCourses.find(c => c.slug === slug);
                return (
                  <div key={slug} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white">
                    <span className="text-sm">{course?.title || slug}</span>
                    <button className="ml-auto text-gray-400 hover:text-red-500 transition" onClick={() => setSelectedPrereqs(prev => prev.filter(x => x !== slug))}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSection === 'Course Files' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-heading">Course Files</h3>
            <p className="text-sm text-gray-400">Upload supplementary materials (PDFs, code files, resources) for students to download.</p>

            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-300 transition cursor-pointer relative"
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-orange-400', 'bg-orange-50'); }}
              onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('border-orange-400', 'bg-orange-50'); }}
              onDrop={async (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-orange-400', 'bg-orange-50');
                const files = Array.from(e.dataTransfer.files);
                setFilesUploading(true);
                for (const f of files) {
                  const sizeStr = f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(1)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`;
                  try {
                    const res = await api.uploadMedia(f, 'course-files');
                    setCourseFiles(prev => [...prev, { name: f.name, size: sizeStr, url: res.file }]);
                  } catch { setCourseFiles(prev => [...prev, { name: f.name, size: 'Upload failed' }]); }
                }
                setFilesUploading(false);
              }}
              onClick={() => document.getElementById('course-file-input')?.click()}
            >
              <input
                id="course-file-input"
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.zip,.py,.js,.ts,.html,.css,.md,.txt,.doc,.docx,.pptx,.xlsx"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  setFilesUploading(true);
                  for (const f of files) {
                    const sizeStr = f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(1)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`;
                    try {
                      const res = await api.uploadMedia(f, 'course-files');
                      setCourseFiles(prev => [...prev, { name: f.name, size: sizeStr, url: res.file }]);
                    } catch { setCourseFiles(prev => [...prev, { name: f.name, size: 'Upload failed' }]); }
                  }
                  setFilesUploading(false);
                  e.target.value = '';
                }}
              />
              <p className="text-3xl mb-2">📁</p>
              {filesUploading ? (
                <p className="text-sm text-orange-500 mb-2">Uploading...</p>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-2">Drag & drop files here</p>
                  <span className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition inline-block">Browse files</span>
                </>
              )}
              <p className="text-xs text-gray-400 mt-2">PDF, ZIP, code files, documents — max 50MB each</p>
            </div>

            {courseFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{courseFiles.length} file{courseFiles.length > 1 ? 's' : ''} added</p>
                {courseFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white">
                    <span className="text-lg">{f.name.endsWith('.pdf') ? '📄' : f.name.endsWith('.zip') ? '🗜️' : f.name.endsWith('.py') ? '🐍' : '📎'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{f.name}</p>
                      <p className="text-xs text-gray-400">{f.size}</p>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition" onClick={(e) => { e.stopPropagation(); setCourseFiles(prev => prev.filter((_, j) => j !== i)); }}>🗑️</button>
                  </div>
                ))}
              </div>
            )}

            {courseFiles.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-400">No files uploaded yet</div>
            )}

            {filesUploading && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                <span className="font-medium">⏳ Uploading files...</span> Please wait.
              </div>
            )}
          </div>
        )}

        {activeSection === 'Certificate' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold font-heading">Certificate</h3>
            <Toggle checked={certificate} onChange={setCertificate} label="Issue a certificate upon completion" />

            {certificate && (
              <div>
                <p className="text-sm text-gray-500 mb-3">Select a certificate template:</p>
                <div className="grid grid-cols-3 gap-4">
                  {certificateTemplates.map(t => (
                    <button key={t.id} onClick={() => setSelectedCertTemplate(t.id)}
                      className={`p-3 rounded-xl border-2 transition ${selectedCertTemplate === t.id ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className={`w-full h-24 ${t.color} rounded-lg mb-2 flex items-center justify-center`}>
                        <div className="text-center">
                          <p className="text-xs text-gray-400">📜</p>
                          <div className="w-16 h-0.5 bg-gray-300 mx-auto mt-1" />
                          <div className="w-12 h-0.5 bg-gray-200 mx-auto mt-1" />
                        </div>
                      </div>
                      <p className="text-xs font-medium text-center">{t.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'Course Page' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold font-heading">Course Page Layout</h3>
            <p className="text-sm text-gray-400">Choose how your course page looks to students</p>
            <div className="grid grid-cols-3 gap-4">
              {layoutTemplates.map(t => (
                <button key={t.id} onClick={() => setSelectedLayout(t.id)}
                  className={`p-4 rounded-xl border-2 transition ${selectedLayout === t.id ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className={`w-full h-28 ${t.color} rounded-lg mb-3 relative overflow-hidden`}>
                    <div className="absolute inset-x-3 top-3 h-8 bg-white/60 rounded" />
                    <div className="absolute inset-x-3 top-14 space-y-1.5">
                      <div className="h-2 bg-white/40 rounded w-3/4" />
                      <div className="h-2 bg-white/40 rounded w-1/2" />
                      <div className="h-2 bg-white/40 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedLayout === t.id ? 'border-blue-500' : 'border-gray-300'}`}>
                      {selectedLayout === t.id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <p className="text-sm font-medium">{t.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div></div>
    </div>
  );
}
