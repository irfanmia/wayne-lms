'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  email_sent?: boolean;
}

interface Props {
  courseId: number;
  lessonId: number;
  lessonType: string;
  lessonTitle: string;
  lessonContent: string;
}

/* Simple markdown → HTML for AI responses */
function renderMarkdown(md: string): string {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-green-300 p-3 rounded-lg text-xs overflow-x-auto my-2 font-mono"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-orange-50 text-orange-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    // Tables
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim()).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) return '<!--sep-->';
      return cells.map(c => `<td class="px-2 py-1.5 border border-gray-200 text-xs">${c}</td>`).join('');
    })
    // Headings
    .replace(/^### (.+)$/gm, '<h4 class="font-semibold text-gray-800 mt-3 mb-1 text-sm">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-bold text-gray-900 mt-3 mb-1 text-sm">$1</h3>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-3 border-orange-400 pl-3 py-1 my-1 bg-orange-50 rounded-r text-xs text-gray-700 italic">$1</blockquote>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-3 text-xs list-disc list-inside mb-0.5">$1</li>')
    // Ordered lists
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-3 text-xs list-decimal list-inside mb-0.5">$2</li>')
    // Emoji markers
    .replace(/^(✅|❌|💡|⚠️|📌|🔑|📊|🎯) /gm, '<span class="mr-1">$1</span>')
    // Line breaks
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  // Wrap table rows
  html = html.replace(/((<td[^>]*>.*?<\/td>)+)/g, '<tr class="even:bg-gray-50">$1</tr>');
  html = html.replace(/(<tr.*?<\/tr>(\s*<!--sep-->)?(\s*<tr.*?<\/tr>)+)/g,
    '<table class="w-full border-collapse border border-gray-200 rounded-lg my-2 text-xs">$1</table>');
  html = html.replace(/<!--sep-->/g, '');

  return html;
}

export default function AITutorChat({ courseId, lessonId, lessonType, lessonTitle, lessonContent }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [showEmailNote, setShowEmailNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if AI tutor is enabled
  useEffect(() => {
    api.getAITutorSettings()
      .then((d: { enabled: boolean }) => setEnabled(d.enabled))
      .catch(() => setEnabled(false));
  }, []);

  // Load conversation + prompts when opened
  useEffect(() => {
    if (!open || !enabled) return;
    api.getAITutorConversation(lessonId)
      .then((d: { messages?: Message[] }) => {
        if (d.messages && d.messages.length > 0) setMessages(d.messages);
      })
      .catch(() => {});
    api.getAITutorSuggestedPrompts(lessonType)
      .then((d: { prompts: string[] }) => setSuggestedPrompts(d.prompts || []))
      .catch(() => {});
  }, [open, enabled, lessonId, lessonType]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Auto-expand to fullscreen when AI responds with long answer
  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant' && last.content.length > 300 && !fullscreen) {
        setFullscreen(true);
      }
    }
  }, [messages, fullscreen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowEmailNote(false);

    try {
      const resp = await api.sendAITutorMessage({
        course_id: courseId,
        lesson_id: lessonId,
        lesson_type: lessonType,
        lesson_title: lessonTitle,
        lesson_content: lessonContent.slice(0, 500),
        message: text.trim(),
      });
      const aiMsg: Message = {
        role: 'assistant',
        content: resp.response,
        timestamp: new Date().toISOString(),
        email_sent: resp.email_sent,
      };
      setMessages(prev => [...prev, aiMsg]);
      if (resp.email_sent) {
        setShowEmailNote(true);
        setTimeout(() => setShowEmailNote(false), 5000);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
      }]);
    }
    setLoading(false);
  }, [courseId, lessonId, lessonType, lessonTitle, lessonContent, loading]);

  if (!enabled) return null;

  // Collapsed bubble
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 group"
        title="AI Tutor"
      >
        <span className="text-2xl">🤖</span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </button>
    );
  }

  // Panel size classes
  const panelClass = fullscreen
    ? 'fixed inset-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300'
    : 'fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300';

  return (
    <>
      {/* Backdrop for fullscreen */}
      {fullscreen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setFullscreen(false)} />
      )}

      <div className={panelClass}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <h3 className="text-white font-semibold text-sm">AI Tutor</h3>
              <p className="text-orange-100 text-[10px]">Wayne Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Fullscreen toggle */}
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition"
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              )}
            </button>
            <button
              onClick={() => { setOpen(false); setFullscreen(false); }}
              className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition"
              title="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Suggested prompts — only when no messages */}
        {messages.length === 0 && suggestedPrompts.length > 0 && (
          <div className="px-3 py-2 border-b bg-orange-50 shrink-0">
            <p className="text-[10px] text-orange-600 font-medium mb-1.5">💡 Quick questions:</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-2.5 py-1.5 bg-white border border-orange-200 rounded-full text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👋</div>
              <p className="text-gray-500 text-sm font-medium">Hi! I&apos;m your AI Tutor</p>
              <p className="text-gray-400 text-xs mt-1">Ask me anything about this lesson</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mr-2 mt-1">
                  <span className="text-sm">🤖</span>
                </div>
              )}
              <div className={`${fullscreen ? 'max-w-[70%]' : 'max-w-[85%]'} px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-orange-500 text-white rounded-br-md'
                  : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                {msg.role === 'assistant' ? (
                  <div
                    className="ai-tutor-content prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                {msg.email_sent && (
                  <p className="text-[10px] mt-2 pt-1 border-t border-gray-200 text-orange-600 flex items-center gap-1">
                    📧 Detailed explanation sent to your email
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mr-2">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Email notification toast */}
        {showEmailNote && (
          <div className="mx-3 mb-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-center gap-2 shrink-0">
            <span>📧</span> A detailed explanation has been sent to your email
          </div>
        )}

        {/* Suggested prompts inline (when conversation exists) */}
        {messages.length > 0 && suggestedPrompts.length > 0 && !loading && (
          <div className="px-3 pb-1 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {suggestedPrompts.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="text-[10px] px-2 py-1 bg-orange-50 border border-orange-200 rounded-full text-orange-600 hover:bg-orange-100 transition whitespace-nowrap shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-3 py-2 border-t bg-white shrink-0">
          <form
            onSubmit={e => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 disabled:opacity-40 transition shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
