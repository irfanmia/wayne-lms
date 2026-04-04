'use client';
import { useState, useEffect, useRef } from 'react';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onChange?: (code: string) => void;
  fileName?: string;
}

export default function CodeEditor({ initialCode = '', language = 'python', onChange, fileName }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    onChange?.(e.target.value);
  };

  const lines = code.split('\n');
  const ext = language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language;

  return (
    <div className="bg-gray-900 border border-gray-200 rounded-xl overflow-hidden h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-gray-400 text-xs ml-2">{fileName || `solution.${ext}`}</span>
      </div>
      <div className="flex-1 relative overflow-auto">
        <div className="flex min-h-full">
          <div className="text-gray-600 select-none pr-2 text-right w-12 pt-4 pl-2 font-mono text-sm bg-gray-900 sticky left-0">
            {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            spellCheck={false}
            className="flex-1 bg-transparent text-gray-300 font-mono text-sm p-4 pl-2 resize-none outline-none min-h-full w-full"
            style={{ tabSize: 4 }}
          />
        </div>
      </div>
    </div>
  );
}
