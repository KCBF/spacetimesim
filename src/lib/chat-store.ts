import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

interface ChatSettings {
  userApiKey: string;
  model: string;
  maxTokens: number;
}

interface ChatState {
  // Sessions
  sessions: ChatSession[];
  activeSessionId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  showSettings: boolean;
  showHistory: boolean;

  // Settings
  settings: ChatSettings;

  // Actions
  toggleChat: () => void;
  setIsOpen: (open: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  updateSettings: (settings: Partial<ChatSettings>) => void;

  createSession: () => string;
  setActiveSession: (id: string) => void;
  deleteSession: (id: string) => void;

  sendMessage: (content: string) => Promise<void>;
}

const STORAGE_KEY = 'spacetime-chat-sessions';
const SETTINGS_KEY = 'spacetime-chat-settings';

function loadSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function loadSettings(): ChatSettings {
  const defaults: ChatSettings = { userApiKey: '', model: 'claude-sonnet-4-5-20250929', maxTokens: 2048 };
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch { return defaults; }
}

function saveSettings(settings: ChatSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  // Also set in cookie for SSR access if needed
  document.cookie = `spacetime-has-key=${settings.userApiKey ? '1' : '0'}; path=/; max-age=31536000; SameSite=Lax`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateTitle(content: string): string {
  return content.slice(0, 50) + (content.length > 50 ? '...' : '');
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  isOpen: false,
  isLoading: false,
  showSettings: false,
  showHistory: false,
  settings: { userApiKey: '', model: 'claude-sonnet-4-5-20250929', maxTokens: 2048 },

  toggleChat: () => set(s => ({ isOpen: !s.isOpen, showSettings: false, showHistory: false })),
  setIsOpen: (open) => set({ isOpen: open }),
  setShowSettings: (show) => set({ showSettings: show, showHistory: false }),
  setShowHistory: (show) => set({ showHistory: show, showSettings: false }),

  updateSettings: (partial) => {
    const settings = { ...get().settings, ...partial };
    saveSettings(settings);
    set({ settings });
  },

  createSession: () => {
    const session: ChatSession = {
      id: generateId(),
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const sessions = [session, ...get().sessions];
    saveSessions(sessions);
    set({ sessions, activeSessionId: session.id });
    return session.id;
  },

  setActiveSession: (id) => set({ activeSessionId: id, showHistory: false }),

  deleteSession: (id) => {
    const sessions = get().sessions.filter(s => s.id !== id);
    saveSessions(sessions);
    const activeSessionId = get().activeSessionId === id
      ? (sessions[0]?.id ?? null)
      : get().activeSessionId;
    set({ sessions, activeSessionId });
  },

  sendMessage: async (content: string) => {
    const state = get();
    let sessionId = state.activeSessionId;

    // Create session if none active
    if (!sessionId) {
      sessionId = get().createSession();
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Add user message
    let sessions = get().sessions.map(s =>
      s.id === sessionId
        ? {
            ...s,
            messages: [...s.messages, userMsg],
            title: s.messages.length === 0 ? generateTitle(content) : s.title,
            updatedAt: Date.now(),
          }
        : s
    );
    saveSessions(sessions);
    set({ sessions, isLoading: true });

    try {
      const session = sessions.find(s => s.id === sessionId);
      const apiMessages = session?.messages.map(m => ({
        role: m.role,
        content: m.content,
      })) ?? [];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          userApiKey: get().settings.userApiKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
      };

      sessions = get().sessions.map(s =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() }
          : s
      );
      saveSessions(sessions);
      set({ sessions, isLoading: false });
    } catch (error: unknown) {
      const errMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Error: ${(error as Error).message}`,
        timestamp: Date.now(),
      };
      sessions = get().sessions.map(s =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, errMsg], updatedAt: Date.now() }
          : s
      );
      saveSessions(sessions);
      set({ sessions, isLoading: false });
    }
  },
}));

// Hydrate from localStorage on client
if (typeof window !== 'undefined') {
  const sessions = loadSessions();
  const settings = loadSettings();
  useChatStore.setState({
    sessions,
    activeSessionId: sessions[0]?.id ?? null,
    settings,
  });
}
