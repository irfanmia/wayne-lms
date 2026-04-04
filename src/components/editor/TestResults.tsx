'use client';

export default function TestResults() {
  const tests = [
    { name: 'test_say_hi', status: 'pass', time: '0.01s' },
    { name: 'test_no_name', status: 'pass', time: '0.01s' },
    { name: 'test_blank_name', status: 'fail', time: '0.02s', error: 'AssertionError: Expected "Hello, World!" but got ""' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-green-600 font-mono text-sm">2 passed</span>
        <span className="text-gray-300">•</span>
        <span className="text-red-500 font-mono text-sm">1 failed</span>
      </div>
      {tests.map((test, i) => (
        <div key={i} className={`p-3 rounded-lg border ${test.status === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={test.status === 'pass' ? 'text-green-600' : 'text-red-500'}>{test.status === 'pass' ? '✓' : '✗'}</span>
              <span className="text-gray-700 font-mono text-sm">{test.name}</span>
            </div>
            <span className="text-gray-400 text-xs">{test.time}</span>
          </div>
          {test.error && <pre className="text-red-500 text-xs mt-2 font-mono">{test.error}</pre>}
        </div>
      ))}
    </div>
  );
}
