'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/chat-store';

export function ChatSettings() {
  const settings = useChatStore(s => s.settings);
  const updateSettings = useChatStore(s => s.updateSettings);
  const [keyInput, setKeyInput] = useState(settings.userApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveKey = () => {
    updateSettings({ userApiKey: keyInput });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearKey = () => {
    setKeyInput('');
    updateSettings({ userApiKey: '' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Settings</h3>

      {/* API Key */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Anthropic API Key</label>
        <p className="text-xs text-muted">
          Set your own API key. Stored locally in your browser only — never sent to our servers.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-gray-800 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-gray-500 focus:outline-none focus:border-accent pr-10"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground"
            >
              {showKey ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveKey}
            className="px-3 py-1.5 text-xs rounded-lg bg-accent text-white hover:bg-accent-dim transition-colors"
          >
            {saved ? 'Saved!' : 'Save Key'}
          </button>
          {keyInput && (
            <button
              onClick={handleClearKey}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-muted hover:text-foreground border border-border transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-sm font-medium text-foreground">Status</label>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${settings.userApiKey ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-muted">
            {settings.userApiKey
              ? 'Using your personal API key'
              : 'Using server API key (may be rate-limited or disabled)'}
          </span>
        </div>
      </div>

      {/* Model info */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-sm font-medium text-foreground">Model</label>
        <p className="text-xs text-muted">Claude Sonnet 4.5 — optimized for speed and intelligence</p>
      </div>

      {/* Data notice */}
      <div className="text-[10px] text-gray-600 pt-2 border-t border-border leading-relaxed">
        Chat history is stored locally in your browser&apos;s localStorage. Your API key never leaves your browser
        except when making direct API calls. Clear your browser data to remove all chat history.
      </div>
    </div>
  );
}
