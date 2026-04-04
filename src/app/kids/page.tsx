'use client';

import { useState, useEffect } from 'react';

const FEATURES = [
  { emoji: '🧩', title: 'Drag & Drop Coding', desc: 'No typing needed! Snap blocks together like puzzle pieces.' },
  { emoji: '🎮', title: 'Build Games', desc: 'Create your own games and share them with friends!' },
  { emoji: '🎨', title: 'Creative Art', desc: 'Draw amazing pictures and animations with code!' },
  { emoji: '🏆', title: 'Earn Badges', desc: 'Collect cool badges and level up as you learn!' },
  { emoji: '🔥', title: 'Daily Streaks', desc: 'Code every day and watch your streak grow!' },
  { emoji: '👥', title: 'Learn Together', desc: 'Join a classroom and code with your friends!' },
];

const AGE_GROUPS = [
  { range: '5-7', label: 'Little Coders', emoji: '🌟', color: 'bg-green-100 border-green-300 text-green-700' },
  { range: '8-10', label: 'Code Explorers', emoji: '🚀', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { range: '11-13', label: 'Code Masters', emoji: '⚡', color: 'bg-purple-100 border-purple-300 text-purple-700' },
];

export default function KidsLandingPage() {
  const [bounceIndex, setBounceIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setBounceIndex(i => (i + 1) % FEATURES.length), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Floating mascot */}
          <div className="text-8xl md:text-9xl mb-6 animate-bounce" style={{ animationDuration: '3s' }}>
            🤖
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 font-[Manrope] mb-4">
            Learn to <span className="text-orange-500">Code</span> with Fun!
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Drag, drop, and create amazing things! No typing needed — just snap blocks together
            and watch your ideas come to life! 🎉
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/kids/challenges"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-lg shadow-orange-200"
            >
              🚀 Start Coding!
            </a>
            <a
              href="/kids/dashboard"
              className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-8 rounded-2xl text-lg transition-all border-2 border-gray-200 hover:border-orange-300"
            >
              📊 My Progress
            </a>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-4xl opacity-20 animate-spin" style={{ animationDuration: '20s' }}>⭐</div>
        <div className="absolute top-20 right-16 text-3xl opacity-20 animate-pulse">💫</div>
        <div className="absolute bottom-10 left-1/4 text-3xl opacity-20 animate-bounce">🌈</div>
        <div className="absolute bottom-20 right-1/4 text-4xl opacity-20 animate-pulse">✨</div>
      </section>

      {/* Age Groups */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 font-[Manrope]">
            Pick Your Level! 🎯
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {AGE_GROUPS.map((group) => (
              <a
                key={group.range}
                href={`/kids/challenges?age=${group.range}`}
                className={`${group.color} border-2 rounded-3xl p-8 text-center hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer`}
              >
                <div className="text-5xl mb-4">{group.emoji}</div>
                <h3 className="text-xl font-bold mb-1">{group.label}</h3>
                <p className="text-sm opacity-80">Ages {group.range}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 font-[Manrope]">
            What You Can Do! ✨
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={`bg-orange-50 rounded-2xl p-6 border border-orange-100 transition-all ${
                  i === bounceIndex ? 'transform scale-105 shadow-md border-orange-300' : ''
                }`}
              >
                <div className="text-4xl mb-3">{feature.emoji}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 font-[Manrope]">How It Works 🤔</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            {[
              { step: '1', emoji: '🧩', text: 'Pick a Challenge' },
              { step: '2', emoji: '🔧', text: 'Snap Blocks Together' },
              { step: '3', emoji: '▶️', text: 'Run Your Code' },
              { step: '4', emoji: '🎉', text: 'Earn Stars & Badges!' },
            ].map((s, i) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold mb-2">
                  {s.emoji}
                </div>
                <p className="font-semibold text-gray-700">{s.text}</p>
                {i < 3 && <div className="hidden md:block text-2xl text-orange-300 mt-2">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-orange-500 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[Manrope]">
            Ready to Start Your Coding Adventure? 🚀
          </h2>
          <p className="text-lg opacity-90 mb-8">Join thousands of kids already learning to code!</p>
          <a
            href="/kids/challenges"
            className="inline-block bg-white text-orange-500 font-bold py-4 px-10 rounded-2xl text-lg hover:bg-orange-50 transition-all transform hover:scale-105"
          >
            Let&apos;s Go! 🎮
          </a>
        </div>
      </section>
    </div>
  );
}
