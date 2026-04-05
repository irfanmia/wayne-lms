'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';

interface Submission {
  id: number;
  text_content: string;
  url: string;
  code_content: string;
  code_language: string;
  auto_grade_result: AutoGradeResult | null;
  attempt_number: number;
  status: string;
  grade: number | null;
  feedback: string;
  submitted_at: string;
  file: string | null;
}

interface AutoGradeResult {
  tests: { name: string; passed: boolean }[];
  passed: number;
  total: number;
  all_passed: boolean;
  output: string;
  errors: string;
}

interface Props {
  assignmentId: number;
  title: string;
  description: string;
  submissionType: string;
  answerType?: string;
  points: number;
  dueDate?: string;
  programmingLanguage?: string;
  starterCode?: string;
  testCode?: string;
  rubric?: string;
  maxAttempts?: number;
  autoGrade?: boolean;
  allowedExtensions?: string;
  maxFileSize?: number;
  submission?: Submission | null;
  attemptsUsed?: number;
}

function simpleMarkdown(md: string): string {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-green-300 p-4 rounded-lg text-sm overflow-x-auto my-3"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-orange-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h2>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-1"><span class="font-medium text-gray-700">$1.</span> $2</li>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1 list-disc">$1</li>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function RubricTable({ rubric }: { rubric: string }) {
  // Parse markdown table from rubric text
  const lines = rubric.trim().split('\n');
  const tableLines = lines.filter(l => l.trim().startsWith('|'));
  
  if (tableLines.length < 2) {
    // No table found, extract title and render as plain text
    const title = lines.find(l => l.includes('Grading Rubric'))?.replace(/^#+\s*/, '').trim();
    const items = lines.filter(l => l.trim().startsWith('|') || l.includes('|')).length === 0
      ? lines.filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('|'))
      : [];
    return (
      <div>
        {title && <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>}
        <div className="text-sm text-gray-600 whitespace-pre-wrap">{items.join('\n') || rubric}</div>
      </div>
    );
  }

  // Parse header
  const headerCells = tableLines[0].split('|').map(c => c.trim()).filter(Boolean);
  // Skip separator line (|---|---|)
  const dataLines = tableLines.slice(2);
  const rows = dataLines.map(line => line.split('|').map(c => c.trim()).filter(Boolean));
  
  // Extract title from non-table lines
  const title = lines.find(l => l.includes('Grading Rubric') || l.includes('points'))?.replace(/^#+\s*/, '').trim();

  return (
    <div>
      {title && <p className="text-sm font-medium text-gray-700 mb-3">{title}</p>}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-orange-300">
            {headerCells.map((cell, i) => (
              <th key={i} className={`py-2 px-3 text-left font-semibold text-gray-700 ${i === headerCells.length - 1 ? 'text-right w-20' : ''}`}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-orange-100 ${i % 2 === 1 ? 'bg-orange-50/50' : ''}`}>
              {row.map((cell, j) => (
                <td key={j} className={`py-2 px-3 text-gray-600 ${j === row.length - 1 ? 'text-right font-medium text-orange-600' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  graded: { label: 'Graded', className: 'bg-green-100 text-green-700' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
  returned: { label: 'Returned', className: 'bg-yellow-100 text-yellow-700' },
};

export default function Assignment({
  assignmentId, title, description, submissionType, answerType, points, dueDate,
  programmingLanguage, starterCode, testCode, rubric, maxAttempts = 1,
  autoGrade, allowedExtensions, maxFileSize = 10, submission: initialSubmission,
  attemptsUsed: initialAttemptsUsed = 0,
}: Props) {
  const [textContent, setTextContent] = useState('');
  const [url, setUrl] = useState('');
  const [codeContent, setCodeContent] = useState(starterCode || '');
  const [codeLanguage, setCodeLanguage] = useState(programmingLanguage || '');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(initialSubmission || null);
  const [attemptsUsed, setAttemptsUsed] = useState(initialAttemptsUsed);
  const [testResults, setTestResults] = useState<AutoGradeResult | null>(null);
  const [previousAttempts, setPreviousAttempts] = useState<Submission[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);
  const [expandedAttempts, setExpandedAttempts] = useState<Set<number>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit = attemptsUsed < maxAttempts;
  const statusInfo = submission ? STATUS_BADGES[submission.status] || { label: 'Not submitted', className: 'bg-gray-100 text-gray-600' } : null;

  useEffect(() => {
    if (submission?.auto_grade_result) {
      setTestResults(submission.auto_grade_result);
    }
  }, [submission]);

  const loadAttempts = useCallback(async () => {
    try {
      const data = await api.getAssignmentAttempts(assignmentId);
      setPreviousAttempts(data);
    } catch { /* ignore */ }
  }, [assignmentId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        text_content: textContent,
        url,
        code_content: codeContent,
        code_language: codeLanguage,
      };
      const result = await api.submitAssignment(assignmentId, payload);
      setSubmission(result);
      setAttemptsUsed(prev => prev + 1);
      if (result.auto_grade_result) {
        setTestResults(result.auto_grade_result);
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      setCodeContent(value.substring(0, start) + '    ' + value.substring(end));
      setTimeout(() => { target.selectionStart = target.selectionEnd = start + 4; }, 0);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const codeLines = codeContent.split('\n');
  const isMixed = submissionType === 'mixed' || answerType === 'mixed';
  const isCode = submissionType === 'code' || answerType?.startsWith('code_') || (isMixed && !!programmingLanguage);
  const isFile = submissionType === 'file_upload' || answerType === 'document' || answerType === 'file_any';
  const isUrl = submissionType === 'url' || answerType === 'project_url';
  const isText = submissionType === 'text' || answerType === 'essay' || isMixed;

  const extensions = allowedExtensions ? allowedExtensions.split(',').map(e => e.trim()) : [];

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{isCode ? '💻' : isFile ? '📎' : isUrl ? '🔗' : '📝'}</span>
        <h2 className="text-2xl font-heading font-bold">{title}</h2>
      </div>

      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
        <span className="text-orange-500 font-bold">{points} points</span>
        {dueDate && <span>Due: {new Date(dueDate).toLocaleDateString()}</span>}
        <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-full text-xs">
          {submissionType.replace('_', ' ')}
        </span>
        {answerType && (
          <span className="capitalize px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">
            {answerType.replace('_', ' ')}
          </span>
        )}
        {statusInfo && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        )}
        {maxAttempts > 1 && (
          <span className="text-xs text-gray-400">Attempt {Math.min(attemptsUsed + 1, maxAttempts)} of {maxAttempts}</span>
        )}
      </div>

      {/* Description */}
      {/* TODO: Sanitize dangerouslySetInnerHTML with DOMPurify in production */}
      {description?.startsWith('<') ? (
        <div className="prose prose-sm mb-6" dangerouslySetInnerHTML={{ __html: description }} />
      ) : (
        <div className="prose prose-sm mb-6" dangerouslySetInnerHTML={{ __html: simpleMarkdown(description || '') }} />
      )}

      {/* Rubric */}
      {rubric && (
        <div className="mb-6 border border-orange-200 bg-orange-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-orange-700 mb-3">📋 Grading Rubric</h3>
          <RubricTable rubric={rubric} />
        </div>
      )}

      {/* Grade display */}
      {submission?.status === 'graded' && (
        <div className="mb-6 border border-green-200 bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-lg font-bold text-green-700">{submission.grade}/{points}</p>
              <p className="text-xs text-green-600">Grade received</p>
            </div>
          </div>
          {submission.feedback && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-sm font-medium text-green-700 mb-1">Instructor Feedback:</p>
              <p className="text-sm text-gray-700">{submission.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="mb-6 border rounded-xl overflow-hidden">
          <div className={`px-4 py-3 text-sm font-medium ${testResults.all_passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {testResults.all_passed ? '✅ All tests passed!' : `❌ ${testResults.passed}/${testResults.total} tests passed`}
          </div>
          <div className="p-4 space-y-2">
            {testResults.tests.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span>{t.passed ? '✅' : '❌'}</span>
                <span className={t.passed ? 'text-green-700' : 'text-red-700'}>{t.name}</span>
              </div>
            ))}
            {testResults.errors && (
              <pre className="mt-2 p-3 bg-red-50 text-red-800 text-xs rounded-lg overflow-x-auto">{testResults.errors}</pre>
            )}
          </div>
        </div>
      )}

      {/* Submission form — show if can still submit */}
      {canSubmit && !submission?.status?.match(/graded/) ? (
        <div className="space-y-5">

          {/* Text/Essay input */}
          {(isText) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer</label>
              <textarea
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="Write your answer here..."
                rows={8}
                className="w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">{textContent.length} characters</p>
            </div>
          )}

          {/* Code editor */}
          {(isCode) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Code</label>
                <div className="flex items-center gap-2">
                  {programmingLanguage ? (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-mono">{programmingLanguage}</span>
                  ) : (
                    <select
                      value={codeLanguage}
                      onChange={e => setCodeLanguage(e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1"
                    >
                      <option value="">Select language</option>
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-gray-700">
                <div className="flex bg-[#1e1e2e]">
                  {/* Line numbers */}
                  <div className="select-none text-right pr-3 pl-3 py-3 text-gray-500 text-xs font-mono leading-6 bg-[#181825] border-r border-gray-700">
                    {codeLines.map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  {/* Code area */}
                  <textarea
                    ref={codeRef}
                    value={codeContent}
                    onChange={e => setCodeContent(e.target.value)}
                    onKeyDown={handleCodeKeyDown}
                    spellCheck={false}
                    className="flex-1 bg-[#1e1e2e] text-green-300 font-mono text-sm leading-6 p-3 resize-none outline-none min-h-[200px]"
                    style={{ tabSize: 4 }}
                    rows={Math.max(10, codeLines.length + 2)}
                  />
                </div>
              </div>
              {autoGrade && testCode && (
                <p className="text-xs text-blue-500 mt-2">🧪 Auto-grading enabled — your code will be tested on submission</p>
              )}
            </div>
          )}

          {/* File upload */}
          {(isFile) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  dragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={extensions.length ? extensions.map(e => `.${e}`).join(',') : undefined}
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div>
                    <div className="text-2xl mb-2">📄</div>
                    <p className="font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl mb-2">📁</div>
                    <p className="text-gray-500">Drag & drop a file here or click to browse</p>
                    {extensions.length > 0 && (
                      <p className="text-xs text-gray-400 mt-2">Allowed: {extensions.map(e => `.${e}`).join(', ')}</p>
                    )}
                    <p className="text-xs text-gray-400">Max size: {maxFileSize}MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* URL input */}
          {(isUrl) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submission URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                className="w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {url && !/^https?:\/\/.+/.test(url) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition"
          >
            {submitting ? 'Submitting...' : attemptsUsed > 0 ? 'Resubmit' : 'Submit Assignment'}
          </button>
        </div>
      ) : submission ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="font-medium text-green-700">
            {submission.status === 'graded' ? 'Assignment graded!' : 'Assignment submitted!'}
          </p>
          <p className="text-sm text-green-600 mt-1">
            {submission.status === 'graded'
              ? `You scored ${submission.grade}/${points}`
              : 'Your instructor will review and grade it.'}
          </p>
        </div>
      ) : null}

      {/* Previous attempts */}
      {maxAttempts > 1 && attemptsUsed > 0 && (
        <div className="mt-6">
          <button
            onClick={() => { setShowPrevious(!showPrevious); if (!showPrevious) loadAttempts(); }}
            className="text-sm text-orange-500 hover:text-orange-600"
          >
            {showPrevious ? 'Hide' : 'Show'} previous attempts ({attemptsUsed})
          </button>
          {showPrevious && previousAttempts.length > 0 && (
            <div className="mt-3 space-y-3">
              {previousAttempts.map(a => {
                const isExpanded = expandedAttempts.has(a.id);
                const toggleExpand = () => {
                  setExpandedAttempts(prev => {
                    const next = new Set(prev);
                    if (next.has(a.id)) next.delete(a.id); else next.add(a.id);
                    return next;
                  });
                };
                return (
                  <div key={a.id} className="border rounded-lg text-sm overflow-hidden">
                    <button
                      onClick={toggleExpand}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                        <span className="font-medium">Attempt {a.attempt_number}</span>
                        {a.status === 'graded' && a.grade !== null && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{a.grade}/{points}</span>
                        )}
                        {a.status === 'submitted' && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Submitted</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(a.submitted_at).toLocaleString()}</span>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t bg-gray-50 space-y-3">
                        {a.text_content && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Answer</p>
                            <div className="bg-white rounded-lg p-3 border text-sm text-gray-700 whitespace-pre-wrap">{a.text_content}</div>
                          </div>
                        )}
                        {a.code_content && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Code {a.code_language && <span className="text-purple-600">({a.code_language})</span>}</p>
                            <pre className="bg-[#1e1e2e] text-green-300 rounded-lg p-3 text-xs font-mono overflow-x-auto">{a.code_content}</pre>
                          </div>
                        )}
                        {a.url && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">URL</p>
                            <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline text-sm break-all">{a.url}</a>
                          </div>
                        )}
                        {a.file && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">File</p>
                            <a href={a.file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-orange-500 hover:underline text-sm">📄 Download submission</a>
                          </div>
                        )}
                        {a.feedback && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Instructor Feedback</p>
                            <div className="bg-white rounded-lg p-3 border text-sm text-gray-700">{a.feedback}</div>
                          </div>
                        )}
                        {a.auto_grade_result && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Test Results</p>
                            <div className="bg-white rounded-lg p-3 border space-y-1">
                              {a.auto_grade_result.tests.map((t, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  <span>{t.passed ? '✅' : '❌'}</span>
                                  <span>{t.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
