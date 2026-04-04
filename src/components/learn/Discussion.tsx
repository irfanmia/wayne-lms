'use client';
import { useState } from 'react';
import api from '@/lib/api';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  parent: number | null;
  user_name: string;
  user_avatar: string;
  replies: Comment[];
}

interface DiscussionProps {
  lessonId: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function CommentItem({ comment, lessonId, onReplyAdded }: { comment: Comment; lessonId: number; onReplyAdded: () => void }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const submitReply = async () => {
    if (!replyText.trim()) return;
    try {
      await api.addLessonComment(lessonId, replyText, comment.id);
    } catch { /* mock fallback */ }
    setReplyText('');
    setShowReply(false);
    onReplyAdded();
  };

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
        {comment.user_name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">{comment.user_name}</span>
          <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{comment.content}</p>
        <button onClick={() => setShowReply(!showReply)} className="text-xs text-orange-600 hover:text-orange-700 font-medium cursor-pointer">
          Reply
        </button>
        {showReply && (
          <div className="mt-2 flex gap-2">
            <input
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              onKeyDown={e => e.key === 'Enter' && submitReply()}
            />
            <button onClick={submitReply} className="px-3 py-2 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer">
              Reply
            </button>
          </div>
        )}
        {comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
            {comment.replies.map(r => (
              <CommentItem key={r.id} comment={r} lessonId={lessonId} onReplyAdded={onReplyAdded} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Discussion({ lessonId }: DiscussionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loaded, setLoaded] = useState(false);

  const loadComments = async () => {
    if (loaded) return;
    try {
      const data = await api.getLessonComments(lessonId);
      if (data) setComments(Array.isArray(data) ? data : []);
    } catch { /* API unavailable */ }
    setLoaded(true);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.addLessonComment(lessonId, newComment);
      const data = await api.getLessonComments(lessonId);
      if (data) setComments(data);
    } catch {
      // Mock fallback
      setComments(prev => [...prev, {
        id: Date.now(), content: newComment, created_at: new Date().toISOString(),
        parent: null, user_name: 'You', user_avatar: '', replies: [],
      }]);
    }
    setNewComment('');
  };

  // Load on first render
  if (!loaded) loadComments();

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-medium text-orange-600 shrink-0">
          Y
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Share your thoughts or ask a question..."
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 resize-none"
          />
          <button onClick={submitComment} className="mt-2 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer">
            Comment
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map(c => (
          <CommentItem key={c.id} comment={c} lessonId={lessonId} onReplyAdded={loadComments} />
        ))}
      </div>
    </div>
  );
}
