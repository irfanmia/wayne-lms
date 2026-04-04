'use client';

export default function CodeEditor() {
  return (
    <div className="bg-gray-900 border border-gray-200 rounded-xl overflow-hidden h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-gray-400 text-xs ml-2">solution.py</span>
      </div>
      <div className="flex-1 p-4 font-mono text-sm">
        <div className="flex">
          <div className="text-gray-600 select-none pr-4 text-right w-10">
            {[1,2,3,4,5,6,7,8,9,10].map(n => <div key={n}>{n}</div>)}
          </div>
          <div className="flex-1 text-gray-300">
            <div><span className="text-purple-400">def</span> <span className="text-blue-400">hello</span>():</div>
            <div>    <span className="text-green-400">&quot;Return a greeting.&quot;</span></div>
            <div>    <span className="text-purple-400">return</span> <span className="text-green-400">&quot;Hello, World!&quot;</span></div>
            <div></div>
            <div></div>
            <div className="text-gray-600"># Write your solution above</div>
            <div className="text-gray-600"># Run tests to check your work</div>
            <div></div>
            <div></div>
            <div className="text-gray-700">~</div>
          </div>
        </div>
      </div>
    </div>
  );
}
