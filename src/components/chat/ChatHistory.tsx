'use client';

import { useChatStore } from '@/lib/chat-store';

export function ChatHistory() {
  const sessions = useChatStore(s => s.sessions);
  const activeSessionId = useChatStore(s => s.activeSessionId);
  const setActiveSession = useChatStore(s => s.setActiveSession);
  const deleteSession = useChatStore(s => s.deleteSession);

  return (
    <div className="flex-1 overflow-y-auto p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Chat History</h3>
      {sessions.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">No conversations yet</p>
      ) : (
        <div className="space-y-1">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                session.id === activeSessionId
                  ? 'bg-accent/20 text-foreground'
                  : 'text-muted hover:bg-surface-hover hover:text-foreground'
              }`}
              onClick={() => setActiveSession(session.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{session.title}</div>
                <div className="text-[10px] text-gray-500">
                  {session.messages.length} messages &middot; {new Date(session.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Delete"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
