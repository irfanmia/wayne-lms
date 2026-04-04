'use client';
import { useState } from 'react';
import { RichTextEditor } from './TextLessonEditor';

const assignmentTypes = ['Essay', 'Code', 'File Upload', 'URL', 'Mixed'] as const;
const languages = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'C#', 'Ruby', 'Swift', 'Kotlin', 'SQL'];

export default function AssignmentEditor({ title: initialTitle }: { title: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [type, setType] = useState<string>('Code');
  const [language, setLanguage] = useState('Python');
  const [maxAttempts, setMaxAttempts] = useState('3');
  const [dueDate, setDueDate] = useState('');
  const [autoGrade, setAutoGrade] = useState(true);
  const [instructions, setInstructions] = useState('');
  const [essayContent, setEssayContent] = useState('');
  const [starterCode, setStarterCode] = useState('def solution():\n    pass');
  const [testCode, setTestCode] = useState('def test_solution():\n    assert solution() is not None');
  const [maxFileSize, setMaxFileSize] = useState('10');
  const [allowedExtensions, setAllowedExtensions] = useState('.pdf,.doc,.docx,.txt');
  const [urlPlaceholder, setUrlPlaceholder] = useState('https://github.com/...');
  const [rubric, setRubric] = useState([
    { id: '1', criterion: 'Correctness', points: 50 },
    { id: '2', criterion: 'Code Quality', points: 30 },
    { id: '3', criterion: 'Documentation', points: 20 },
  ]);

  return (
    <div className="p-6 w-[70%] mx-auto">
      {/* Type Badge + Title + Save */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 whitespace-nowrap flex items-center gap-1.5">
            📋 Assignment
          </span>
          <input
            className="flex-1 text-lg font-heading font-semibold border border-gray-200 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none bg-white"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter assignment name"
          />
        </div>
        <button className="ml-4 px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition cursor-pointer">
          Save
        </button>
      </div>

      <div className="space-y-6">
        {/* Assignment Type + Settings */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assignment Type</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              {assignmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {(type === 'Code' || type === 'Mixed') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Attempts</label>
            <input
              type="number"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
              value={maxAttempts}
              onChange={e => setMaxAttempts(e.target.value)}
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Auto-grading toggle */}
        <div className="flex items-center justify-between py-3 border-t border-b border-gray-100">
          <div>
            <span className="text-sm text-gray-700 font-medium">Auto-grading</span>
            <p className="text-xs text-gray-400 mt-0.5">Automatically grade submissions using test cases</p>
          </div>
          <button
            onClick={() => setAutoGrade(!autoGrade)}
            className={`relative w-11 h-6 rounded-full transition cursor-pointer ${autoGrade ? 'bg-orange-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${autoGrade ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Instructions - Rich Text Editor (for all types) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Assignment Instructions</label>
          <RichTextEditor
            value={instructions}
            onChange={setInstructions}
            minHeight="150px"
            placeholder="Describe what students need to do..."
          />
        </div>

        {/* Essay-specific: Rich Text Editor for student response area description */}
        {(type === 'Essay' || type === 'Mixed') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Essay Prompt / Content Area</label>
            <p className="text-xs text-gray-400 mb-2">This rich text area is what students will see and write in. Add any reference material, guiding questions, or formatting templates here.</p>
            <RichTextEditor
              value={essayContent}
              onChange={setEssayContent}
              minHeight="300px"
              placeholder="Write your essay prompt here. Students will see this along with a rich text editor to compose their response..."
            />
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Minimum word count</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Maximum word count</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                  placeholder="e.g., 2000"
                />
              </div>
            </div>
          </div>
        )}

        {/* Code-specific */}
        {(type === 'Code' || type === 'Mixed') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Starter Code</label>
              <p className="text-xs text-gray-400 mb-2">Code template students will start with</p>
              <textarea
                className="w-full px-4 py-3 border border-gray-700 rounded-lg text-sm font-mono min-h-[150px] bg-gray-900 text-green-400 focus:border-orange-500 focus:outline-none leading-relaxed"
                value={starterCode}
                onChange={e => setStarterCode(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Code</label>
              <p className="text-xs text-gray-400 mb-2">Test cases for auto-grading (pytest format)</p>
              <textarea
                className="w-full px-4 py-3 border border-gray-700 rounded-lg text-sm font-mono min-h-[150px] bg-gray-900 text-green-400 focus:border-orange-500 focus:outline-none leading-relaxed"
                value={testCode}
                onChange={e => setTestCode(e.target.value)}
              />
            </div>
          </>
        )}

        {/* File Upload-specific */}
        {(type === 'File Upload' || type === 'Mixed') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max file size (MB)</label>
              <input
                type="number"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                value={maxFileSize}
                onChange={e => setMaxFileSize(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Allowed extensions</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                value={allowedExtensions}
                onChange={e => setAllowedExtensions(e.target.value)}
                placeholder=".pdf,.doc,.docx,.txt"
              />
            </div>
          </div>
        )}

        {/* URL-specific */}
        {(type === 'URL' || type === 'Mixed') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">URL placeholder text</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
              value={urlPlaceholder}
              onChange={e => setUrlPlaceholder(e.target.value)}
              placeholder="e.g., https://github.com/username/repo"
            />
          </div>
        )}

        {/* Rubric */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grading Rubric</label>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_80px_40px] gap-3 px-4 py-2 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
              <span>#</span>
              <span>Criterion</span>
              <span>Points</span>
              <span></span>
            </div>
            {rubric.map((r, idx) => (
              <div key={r.id} className="grid grid-cols-[auto_1fr_80px_40px] gap-3 px-4 py-2.5 border-b border-gray-100 items-center">
                <span className="text-xs text-gray-400 font-medium">{idx + 1}</span>
                <input
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                  value={r.criterion}
                  onChange={e => { const n = [...rubric]; n[idx] = { ...r, criterion: e.target.value }; setRubric(n); }}
                />
                <input
                  type="number"
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:border-orange-500 focus:outline-none"
                  value={r.points}
                  onChange={e => { const n = [...rubric]; n[idx] = { ...r, points: Number(e.target.value) }; setRubric(n); }}
                />
                <button
                  onClick={() => setRubric(rubric.filter(x => x.id !== r.id))}
                  className="text-gray-300 hover:text-red-500 text-center cursor-pointer"
                >
                  🗑️
                </button>
              </div>
            ))}
            <div className="px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setRubric([...rubric, { id: String(Date.now()), criterion: '', points: 10 }])}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
              >
                ➕ Add criterion
              </button>
              <span className="text-sm text-gray-500">
                Total: <strong>{rubric.reduce((sum, r) => sum + r.points, 0)}</strong> points
              </span>
            </div>
          </div>
        </div>

        {/* Save button at bottom */}
        <div className="flex justify-end pt-4">
          <button className="px-8 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition cursor-pointer">
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
