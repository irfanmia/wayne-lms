'use client';

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  time?: string;
  error?: string;
}

interface TestResultsProps {
  results?: TestResult[];
  running?: boolean;
  message?: string;
}

export default function TestResults({ results, running, message }: TestResultsProps) {
  if (running) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mb-3" />
        <p className="text-sm">Running tests...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    if (message) {
      return (
        <div className="py-8">
          <pre className="text-sm text-gray-600 whitespace-pre-wrap">{message}</pre>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium">Waiting for you to run tests</p>
        <p className="text-xs mt-1">Click "Run Tests" to check your solution</p>
      </div>
    );
  }

  const passed = results.filter(t => t.status === 'pass').length;
  const failed = results.filter(t => t.status === 'fail').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        {passed > 0 && <span className="text-green-600 font-mono text-sm">{passed} passed</span>}
        {passed > 0 && failed > 0 && <span className="text-gray-300">•</span>}
        {failed > 0 && <span className="text-red-500 font-mono text-sm">{failed} failed</span>}
        {failed === 0 && passed > 0 && <span className="text-green-600 text-sm ml-2">✅ All tests passed!</span>}
      </div>
      {results.map((test, i) => (
        <div key={i} className={`p-3 rounded-lg border ${test.status === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={test.status === 'pass' ? 'text-green-600' : 'text-red-500'}>{test.status === 'pass' ? '✓' : '✗'}</span>
              <span className="text-gray-700 font-mono text-sm">{test.name}</span>
            </div>
            {test.time && <span className="text-gray-400 text-xs">{test.time}</span>}
          </div>
          {test.error && <pre className="text-red-500 text-xs mt-2 font-mono whitespace-pre-wrap">{test.error}</pre>}
        </div>
      ))}
    </div>
  );
}
