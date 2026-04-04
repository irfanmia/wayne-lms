'use client';
import { useState } from 'react';

interface StreamLessonProps {
  streamUrl: string;
  platform: string;
  scheduledAt?: string;
  isLive: boolean;
  recordingUrl?: string;
  lessonTitle: string;
}

export default function StreamLesson({ streamUrl, platform, scheduledAt, isLive, recordingUrl, lessonTitle }: StreamLessonProps) {
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { user: 'Sarah Chen', text: 'Welcome everyone! Stream starts in a moment.', time: '2 min ago' },
    { user: 'Alice', text: 'Excited for this session! 🎉', time: '1 min ago' },
  ]);

  const videoUrl = recordingUrl || streamUrl;
  const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();

  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    setMessages([...messages, { user: 'You', text: chatMessage, time: 'Just now' }]);
    setChatMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm text-orange-500 font-medium">Live stream</p>
        {isLive && (
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">● LIVE</span>
        )}
        {isScheduled && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            Scheduled: {new Date(scheduledAt!).toLocaleDateString()}
          </span>
        )}
      </div>
      <h1 className="text-2xl font-heading font-bold mb-4">{lessonTitle}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video */}
        <div className="lg:col-span-2">
          {isScheduled && !isLive ? (
            <div className="bg-gray-900 rounded-xl flex items-center justify-center h-80">
              <div className="text-center text-white">
                <div className="text-5xl mb-4">📡</div>
                <p className="text-xl font-bold">Stream starts</p>
                <p className="text-gray-400">{new Date(scheduledAt!).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="bg-black rounded-xl overflow-hidden aspect-video">
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span className="capitalize">📺 {platform}</span>
            {recordingUrl && <span>📹 Recording available</span>}
          </div>
        </div>

        {/* Chat */}
        <div className="bg-gray-50 rounded-xl border flex flex-col h-80 lg:h-auto">
          <div className="p-3 border-b font-medium text-sm">Live Chat</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm">{m.user}</span>
                  <span className="text-xs text-gray-400">{m.time}</span>
                </div>
                <p className="text-sm text-gray-700">{m.text}</p>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
