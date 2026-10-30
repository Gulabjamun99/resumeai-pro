import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, PlusCircle, RotateCcw, RotateCw, CheckCircle2, Key, Check, X, ShieldAlert } from 'lucide-react';
import { getUserGeminiKey, saveUserGeminiKey, hasActiveGeminiKey } from '../services/geminiService.js';

export default function Header({ onNewResume, canUndo = false, canRedo = false, onUndo, onRedo, currentVersion = 1 }) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const current = getUserGeminiKey();
    setInputKey(current);
    setHasKey(hasActiveGeminiKey());
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    saveUserGeminiKey(inputKey);
    setHasKey(hasActiveGeminiKey());
    setIsKeySaved(true);
    setTimeout(() => {
      setIsKeySaved(false);
      setShowKeyModal(false);
    }, 1000);
  };

  const handleClearKey = () => {
    saveUserGeminiKey('');
    setInputKey('');
    setHasKey(hasActiveGeminiKey());
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">ResumeAI</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/70 px-2 py-0.5 rounded-full">
                Pro Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Universal AI Resume Architect & Live Studio
            </p>
          </div>
        </div>

        {/* Middle Status Pill / AI Key Trigger */}
        <button
          type="button"
          onClick={() => setShowKeyModal(true)}
          title="Click to configure Gemini API Key"
          className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-600 font-medium transition cursor-pointer"
        >
          <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`}></span>
          <span>{hasKey ? 'Gemini 2.5 Flash Active' : 'AI Engine Ready'}</span>
          <Key className="w-3 h-3 text-slate-400 ml-0.5" />
          <span className="text-slate-300">•</span>
          <span className="font-mono text-slate-500">v{currentVersion}</span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile AI Key button */}
          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="md:hidden p-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
            title="Configure AI API Key"
          >
            <Key className="w-3.5 h-3.5 text-blue-600" />
          </button>

          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={`p-2 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                canUndo 
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs' 
                  : 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          {onRedo && (
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className={`p-2 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                canRedo 
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs' 
                  : 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Redo</span>
            </button>
          )}

          {onNewResume && (
            <button
              type="button"
              onClick={onNewResume}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Resume</span>
            </button>
          )}
        </div>
      </header>

      {/* AI Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Gemini AI Settings</h3>
                <p className="text-xs text-slate-500">Configure your Google Gemini API Key</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Enter your Google AI Studio Gemini API Key for high-speed parsing, multi-modal vision, and live interactive career coaching. The key is saved safely in your browser.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy... or paste key here"
                  className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {inputKey ? (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear Key
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer flex items-center gap-1.5"
                  >
                    {isKeySaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <span>Save & Activate</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
