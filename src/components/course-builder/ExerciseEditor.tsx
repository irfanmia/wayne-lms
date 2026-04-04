'use client';
import { useState } from 'react';

const tracks = ['Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust'];
const concepts = ['Basics', 'Strings', 'Loops', 'Functions', 'OOP', 'Data Structures', 'Algorithms'];
const difficulties = ['easy', 'medium', 'hard'] as const;

export default function ExerciseEditor({ title: initialTitle }: { title: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [track, setTrack] = useState('Python');
  const [concept, setConcept] = useState('Basics');
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [points, setPoints] = useState('10');
  const [instructions, setInstructions] = useState('Write a function that takes a number and returns its factorial.');
  const [starterCode, setStarterCode] = useState('def factorial(n):\n    # Your code here\n    pass');
  const [solutionCode, setSolutionCode] = useState('def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)');
  const [testCode, setTestCode] = useState('assert factorial(5) == 120\nassert factorial(0) == 1\nassert factorial(1) == 1');

  return (
    <div className="p-6 w-[70%] mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">EXERCISE</span>
      </div>
      <input className="w-full text-2xl font-heading font-semibold border-0 border-b-2 border-gray-200 focus:border-orange-500 focus:outline-none pb-2 mb-6 bg-transparent" value={title} onChange={e => setTitle(e.target.value)} />

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Track</label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm" value={track} onChange={e => setTrack(e.target.value)}>
              {tracks.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Concept</label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm" value={concept} onChange={e => setConcept(e.target.value)}>
              {concepts.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Difficulty</label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {difficulties.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Points</label>
            <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={points} onChange={e => setPoints(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Instructions</label>
          <textarea className="w-full px-3 py-2 border rounded-lg text-sm min-h-[80px]" value={instructions} onChange={e => setInstructions(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Starter Code</label>
          <textarea className="w-full px-3 py-2 border rounded-lg text-sm font-mono min-h-[100px] bg-gray-900 text-green-400" value={starterCode} onChange={e => setStarterCode(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Solution Code</label>
          <textarea className="w-full px-3 py-2 border rounded-lg text-sm font-mono min-h-[100px] bg-gray-900 text-blue-400" value={solutionCode} onChange={e => setSolutionCode(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Test Code</label>
          <textarea className="w-full px-3 py-2 border rounded-lg text-sm font-mono min-h-[100px] bg-gray-900 text-yellow-400" value={testCode} onChange={e => setTestCode(e.target.value)} />
        </div>

        <button className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">Save Exercise</button>
      </div>
    </div>
  );
}
