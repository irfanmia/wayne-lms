import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kids Coding Zone | Wayne LMS',
  description: 'Fun coding adventures for kids! Learn to code with drag-and-drop blocks, build games, and earn cool badges.',
};

export default function KidsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Kids Navigation Bar */}
      <nav className="bg-white shadow-sm border-b-4 border-orange-400 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/kids" className="flex items-center gap-2">
              <span className="text-3xl">🤖</span>
              <span className="text-xl font-bold text-gray-900 font-[Manrope]">
                Million<span className="text-orange-500">Coders</span>
                <span className="text-sm ml-1 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Kids</span>
              </span>
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="/kids/challenges" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
                🎯 Challenges
              </a>
              <a href="/kids/dashboard" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
                📊 My Progress
              </a>
              <a href="/kids/parent" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                👨‍👩‍👧 Parents
              </a>
              <a href="/kids/teacher" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                👩‍🏫 Teachers
              </a>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <a href="/kids/challenges" className="text-2xl">🎯</a>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
      {/* Kids Footer */}
      <footer className="bg-orange-50 border-t border-orange-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            🤖 Wayne LMS Kids — Making coding fun for everyone!
          </p>
          <div className="flex justify-center gap-4 mt-3 text-sm">
            <a href="/kids/parent" className="text-orange-500 hover:underline">For Parents</a>
            <a href="/kids/teacher" className="text-orange-500 hover:underline">For Teachers</a>
            <a href="/" className="text-gray-400 hover:underline">Main Site</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
