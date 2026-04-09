'use client';
import { useState, useRef, useEffect } from 'react';

const EMOJIS: { group: string; items: { emoji: string; name: string }[] }[] = [
  {
    group: 'Education',
    items: [
      { emoji: '📚', name: 'books' },
      { emoji: '📖', name: 'book' },
      { emoji: '📝', name: 'memo' },
      { emoji: '✏️', name: 'pencil' },
      { emoji: '🎓', name: 'graduation' },
      { emoji: '🏫', name: 'school' },
      { emoji: '🧑‍🏫', name: 'teacher' },
      { emoji: '📐', name: 'ruler' },
      { emoji: '📏', name: 'straight ruler' },
      { emoji: '🔬', name: 'microscope' },
      { emoji: '🔭', name: 'telescope' },
      { emoji: '🧪', name: 'test tube' },
      { emoji: '🧫', name: 'petri dish' },
      { emoji: '🧬', name: 'dna' },
      { emoji: '📊', name: 'chart' },
      { emoji: '📈', name: 'graph up' },
      { emoji: '📉', name: 'graph down' },
      { emoji: '🗂️', name: 'folder' },
      { emoji: '📋', name: 'clipboard' },
      { emoji: '📌', name: 'pin' },
    ],
  },
  {
    group: 'Technology',
    items: [
      { emoji: '💻', name: 'laptop' },
      { emoji: '🖥️', name: 'desktop' },
      { emoji: '🖨️', name: 'printer' },
      { emoji: '⌨️', name: 'keyboard' },
      { emoji: '🖱️', name: 'mouse' },
      { emoji: '📱', name: 'phone' },
      { emoji: '⚙️', name: 'gear' },
      { emoji: '🔧', name: 'wrench' },
      { emoji: '🔩', name: 'bolt' },
      { emoji: '💾', name: 'floppy disk' },
      { emoji: '💿', name: 'cd' },
      { emoji: '📡', name: 'satellite' },
      { emoji: '🤖', name: 'robot' },
      { emoji: '🧠', name: 'brain' },
      { emoji: '⚡', name: 'lightning' },
      { emoji: '🔌', name: 'plug' },
      { emoji: '🖲️', name: 'trackball' },
      { emoji: '💡', name: 'bulb idea' },
      { emoji: '🔋', name: 'battery' },
      { emoji: '📲', name: 'mobile' },
    ],
  },
  {
    group: 'Programming',
    items: [
      { emoji: '👨‍💻', name: 'developer' },
      { emoji: '👩‍💻', name: 'developer woman' },
      { emoji: '🐍', name: 'python snake' },
      { emoji: '☕', name: 'java coffee' },
      { emoji: '🦀', name: 'rust crab' },
      { emoji: '🐹', name: 'go gopher' },
      { emoji: '⚛️', name: 'react atom' },
      { emoji: '🌐', name: 'web globe' },
      { emoji: '🗃️', name: 'database' },
      { emoji: '🔐', name: 'security lock' },
      { emoji: '🧩', name: 'puzzle' },
      { emoji: '🏗️', name: 'architecture' },
      { emoji: '🚀', name: 'rocket deploy' },
      { emoji: '🐛', name: 'bug' },
      { emoji: '🧪', name: 'test' },
      { emoji: '📦', name: 'package' },
      { emoji: '🔗', name: 'link' },
      { emoji: '📟', name: 'pager' },
      { emoji: '🖊️', name: 'pen code' },
      { emoji: '🛠️', name: 'tools' },
    ],
  },
  {
    group: 'Business',
    items: [
      { emoji: '💼', name: 'briefcase business' },
      { emoji: '📊', name: 'bar chart' },
      { emoji: '💰', name: 'money bag' },
      { emoji: '💵', name: 'dollar' },
      { emoji: '🏦', name: 'bank' },
      { emoji: '🤝', name: 'handshake' },
      { emoji: '📣', name: 'megaphone' },
      { emoji: '📢', name: 'loudspeaker' },
      { emoji: '🎯', name: 'target' },
      { emoji: '🏆', name: 'trophy' },
      { emoji: '🥇', name: 'gold medal' },
      { emoji: '📆', name: 'calendar' },
      { emoji: '🗓️', name: 'planner' },
      { emoji: '✅', name: 'check' },
      { emoji: '🔑', name: 'key' },
      { emoji: '🏢', name: 'office building' },
      { emoji: '👔', name: 'tie' },
      { emoji: '📩', name: 'email' },
      { emoji: '📤', name: 'outbox' },
      { emoji: '🤑', name: 'money' },
    ],
  },
  {
    group: 'Design & Art',
    items: [
      { emoji: '🎨', name: 'art palette' },
      { emoji: '🖌️', name: 'paintbrush' },
      { emoji: '✒️', name: 'pen nib' },
      { emoji: '📐', name: 'triangle ruler' },
      { emoji: '🖼️', name: 'frame picture' },
      { emoji: '🎭', name: 'theater' },
      { emoji: '🎬', name: 'film' },
      { emoji: '📷', name: 'camera' },
      { emoji: '📸', name: 'photo' },
      { emoji: '🎞️', name: 'film strip' },
      { emoji: '🎤', name: 'microphone' },
      { emoji: '🎧', name: 'headphones' },
      { emoji: '🎼', name: 'music score' },
      { emoji: '🎵', name: 'music note' },
      { emoji: '🎶', name: 'music notes' },
      { emoji: '🎹', name: 'piano' },
      { emoji: '🎸', name: 'guitar' },
      { emoji: '🎮', name: 'game controller' },
      { emoji: '👁️', name: 'eye' },
      { emoji: '✨', name: 'sparkles' },
    ],
  },
  {
    group: 'Science & Math',
    items: [
      { emoji: '🔢', name: 'numbers' },
      { emoji: '➕', name: 'plus' },
      { emoji: '➖', name: 'minus' },
      { emoji: '✖️', name: 'multiply' },
      { emoji: '➗', name: 'divide' },
      { emoji: '∞', name: 'infinity' },
      { emoji: '🔬', name: 'science lab' },
      { emoji: '⚗️', name: 'chemistry' },
      { emoji: '🌡️', name: 'thermometer' },
      { emoji: '🧲', name: 'magnet' },
      { emoji: '☢️', name: 'radioactive' },
      { emoji: '🌍', name: 'earth' },
      { emoji: '🌌', name: 'galaxy' },
      { emoji: '☀️', name: 'sun' },
      { emoji: '🌙', name: 'moon' },
      { emoji: '⭐', name: 'star' },
      { emoji: '🪐', name: 'planet' },
      { emoji: '💎', name: 'gem' },
      { emoji: '🦠', name: 'microbe' },
      { emoji: '🧮', name: 'abacus' },
    ],
  },
  {
    group: 'Health & Medical',
    items: [
      { emoji: '🏥', name: 'hospital' },
      { emoji: '💊', name: 'pill' },
      { emoji: '🩺', name: 'stethoscope' },
      { emoji: '🩻', name: 'xray' },
      { emoji: '💉', name: 'syringe' },
      { emoji: '🩹', name: 'bandage' },
      { emoji: '❤️', name: 'heart' },
      { emoji: '🧬', name: 'genetics' },
      { emoji: '🦷', name: 'tooth' },
      { emoji: '👁️', name: 'eye care' },
      { emoji: '🧘', name: 'meditation' },
      { emoji: '🏃', name: 'running' },
      { emoji: '🥗', name: 'salad nutrition' },
      { emoji: '💪', name: 'muscle' },
      { emoji: '🧠', name: 'mental health' },
      { emoji: '🌿', name: 'herb' },
      { emoji: '🫁', name: 'lungs' },
      { emoji: '🫀', name: 'heart organ' },
      { emoji: '🤲', name: 'hands' },
      { emoji: '🩼', name: 'crutch' },
    ],
  },
  {
    group: 'Misc',
    items: [
      { emoji: '🌟', name: 'star glow' },
      { emoji: '🔥', name: 'fire' },
      { emoji: '💯', name: 'hundred' },
      { emoji: '🎉', name: 'party' },
      { emoji: '🏅', name: 'medal' },
      { emoji: '📍', name: 'location' },
      { emoji: '🔍', name: 'search' },
      { emoji: '💬', name: 'chat' },
      { emoji: '🗣️', name: 'speaking' },
      { emoji: '👥', name: 'group people' },
      { emoji: '🌏', name: 'global' },
      { emoji: '🏠', name: 'home' },
      { emoji: '🚗', name: 'car' },
      { emoji: '✈️', name: 'plane' },
      { emoji: '🌈', name: 'rainbow' },
      { emoji: '🎁', name: 'gift' },
      { emoji: '⏰', name: 'clock alarm' },
      { emoji: '🔔', name: 'bell' },
      { emoji: '📌', name: 'pushpin' },
      { emoji: '🗺️', name: 'map' },
    ],
  },
];

const ALL_EMOJIS = EMOJIS.flatMap(g => g.items.map(i => ({ ...i, group: g.group })));

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  placeholder?: string;
}

export default function EmojiPicker({ value, onChange, placeholder = 'Pick icon…' }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = search.trim()
    ? ALL_EMOJIS.filter(e => e.name.includes(search.toLowerCase()) || e.emoji.includes(search))
    : activeGroup === 'All'
      ? ALL_EMOJIS
      : ALL_EMOJIS.filter(e => e.group === activeGroup);

  const groups = ['All', ...EMOJIS.map(g => g.group)];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 hover:border-orange-300 transition bg-white text-left"
      >
        {value ? (
          <>
            <span className="text-xl">{value}</span>
            <span className="text-gray-600 flex-1">Selected</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(''); }}
              className="text-gray-400 hover:text-red-400 text-xs px-1"
            >✕</button>
          </>
        ) : (
          <span className="text-gray-400 flex-1">{placeholder}</span>
        )}
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden" style={{ minWidth: 280 }}>
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchRef}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Search emoji…"
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveGroup('All'); }}
            />
          </div>

          {/* Group tabs */}
          {!search && (
            <div className="flex gap-1 px-2 pt-2 overflow-x-auto pb-1 scrollbar-hide">
              {groups.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveGroup(g)}
                  className={`shrink-0 px-2 py-0.5 text-xs rounded-full border transition cursor-pointer ${
                    activeGroup === g
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-0.5 p-2 max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="col-span-8 text-center text-xs text-gray-400 py-4">No results for "{search}"</div>
            ) : (
              filtered.map((e, i) => (
                <button
                  key={i}
                  type="button"
                  title={e.name}
                  onClick={() => { onChange(e.emoji); setOpen(false); setSearch(''); }}
                  className={`text-xl p-1.5 rounded-lg hover:bg-orange-50 transition cursor-pointer text-center ${value === e.emoji ? 'bg-orange-100 ring-2 ring-orange-400' : ''}`}
                >
                  {e.emoji}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
