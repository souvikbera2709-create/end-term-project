import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, AlertCircle, Key, CheckCircle, ExternalLink, Loader, Timer } from 'lucide-react';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Preferred model order — stops at first one that works for this account
const MODEL_PRIORITY = [
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-pro',
];

const SYSTEM_PROMPT = 'You are an elite, highly knowledgeable personal trainer and fitness expert. Your job is to answer user questions about working out, gym equipment, programming, muscle groups, and recovery. Provide detailed, actionable, and medically safe advice. Use bullet points for readability when appropriate. Do not talk about nutrition; refer them to the Nutrition Coach for that. Always be motivating and professional.';

const ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const VALID_ENV_KEY = ENV_KEY && !['your_gemini_api_key_here', 'your_new_gemini_api_key_here'].includes(ENV_KEY);
const LS_KEY = 'cult_pro_gemini_key';
const LS_MODEL = 'cult_pro_gemini_model';

/** Extract retry seconds from Google's error message e.g. "Please retry in 38.86s" */
function parseRetryDelay(msg = '') {
  const m = msg.match(/retry in ([\d.]+)s/i);
  return m ? Math.ceil(parseFloat(m[1])) + 1 : 60;
}

/** Try each model in priority order; skip 404 (not found), re-throw quota/auth errors */
async function callWithAutoModel(apiKey, history, userMessage) {
  const cached = sessionStorage.getItem(LS_MODEL);
  const toTry = cached ? [cached, ...MODEL_PRIORITY.filter(m => m !== cached)] : MODEL_PRIORITY;

  const contents = [...history, { role: 'user', parts: [{ text: userMessage }] }];

  for (const model of toTry) {
    const res = await fetch(`${BASE}/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }),
    });

    if (res.status === 404) {
      // This model doesn't exist for this key — try next
      if (cached === model) sessionStorage.removeItem(LS_MODEL);
      continue;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    // Success — cache this model
    sessionStorage.setItem(LS_MODEL, model);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
    return { text, model, updatedHistory: [...contents, { role: 'model', parts: [{ text }] }] };
  }

  throw new Error('No compatible Gemini model found for your API key. Check your account at aistudio.google.com');
}

export default function AICoach() {
  const [runtimeKey, setRuntimeKey] = useState(() =>
    VALID_ENV_KEY ? ENV_KEY : (localStorage.getItem(LS_KEY) || '')
  );
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [keyValid, setKeyValid] = useState(false);
  const [showKeySetup, setShowKeySetup] = useState(!runtimeKey);
  const [activeModel, setActiveModel] = useState(sessionStorage.getItem(LS_MODEL) || '');
  const [discovering, setDiscovering] = useState(false);

  const historyRef = useRef([]);
  const chatContainerRef = useRef(null);

  const [messages, setMessages] = useState([
    runtimeKey
      ? { id: 1, text: 'Hello! I am your Elite AI Personal Trainer. Ask me anything about workout programming, exercise form, recovery, or gym etiquette.', isBot: true }
      : { id: 1, text: null, isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const retryPayloadRef = useRef(null); // stores { userText, model } for auto-retry

  useEffect(() => { if (!runtimeKey) setShowKeySetup(true); }, [runtimeKey]);

  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages, isTyping, retryCountdown]);

  // Auto-retry countdown timer
  useEffect(() => {
    if (retryCountdown <= 0) return;
    if (retryCountdown === 1 && retryPayloadRef.current) {
      // Time's up — auto-retry the last message
      const { userText } = retryPayloadRef.current;
      retryPayloadRef.current = null;
      setRetryCountdown(0);
      setIsTyping(true);
      callWithAutoModel(runtimeKey, historyRef.current, userText)
        .then(({ text, model, updatedHistory }) => {
          historyRef.current = updatedHistory;
          if (model !== activeModel) setActiveModel(model);
          setMessages(prev => prev.filter(m => !m.isRetryCountdown).concat({ id: Date.now(), text, isBot: true }));
        })
        .catch(err => {
          setMessages(prev => prev.filter(m => !m.isRetryCountdown).concat({
            id: Date.now(), text: `Error: ${err.message}`, isBot: true, isError: true,
          }));
        })
        .finally(() => setIsTyping(false));
      return;
    }
    const t = setTimeout(() => {
      setRetryCountdown(c => c - 1);
      setMessages(prev => prev.map(m =>
        m.isRetryCountdown ? { ...m, text: `⏳ Rate limited — auto-retrying in ${retryCountdown - 1}s...` } : m
      ));
    }, 1000);
    return () => clearTimeout(t);
  }, [retryCountdown, runtimeKey]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) { setKeyError('Please paste your API key.'); return; }
    if (!trimmed.startsWith('AIza') || trimmed.length < 35) {
      setKeyError('Invalid format. Keys start with "AIza" and are 39+ characters.'); return;
    }
    localStorage.setItem(LS_KEY, trimmed);
    sessionStorage.removeItem(LS_MODEL); // clear cached model so we re-discover
    setActiveModel('');
    setRuntimeKey(trimmed);
    setKeyValid(true);
    setShowKeySetup(false);
    setKeyInput('');
    historyRef.current = [];
    setMessages([{ id: Date.now(), text: 'Hello! I am your Elite AI Personal Trainer. Ask me anything about workout programming, exercise form, recovery, or gym etiquette.', isBot: true }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !runtimeKey || isTyping) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userText, isBot: false }]);
    setInput('');
    setIsTyping(true);

    try {
      const { text, model, updatedHistory } = await callWithAutoModel(runtimeKey, historyRef.current, userText);
      historyRef.current = updatedHistory;
      if (model !== activeModel) setActiveModel(model);
      setMessages(prev => [...prev, { id: Date.now() + 1, text, isBot: true }]);
    } catch (err) {
      console.error('Gemini Error:', err);
      setDiscovering(false);
      const isAuthErr = err.message?.includes('API_KEY_INVALID') || err.message?.includes('403');
      const isQuota = err.message?.includes('quota') || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED');
      if (isAuthErr) { setRuntimeKey(''); setShowKeySetup(true); localStorage.removeItem(LS_KEY); }
      if (isQuota) {
        const delay = parseRetryDelay(err.message);
        retryPayloadRef.current = { userText };
        setRetryCountdown(delay);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: `⏳ Rate limited — auto-retrying in ${delay}s...`,
          isBot: true, isError: true, isRetryCountdown: true,
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: isAuthErr ? '🔑 API key rejected. Please enter a valid key.' : `Error: ${err.message}`,
          isBot: true, isError: true,
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-2xl flex flex-col h-[500px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50">
      <div className="p-4 border-b border-gray-800 bg-[#252525] rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="text-blue-500" size={22} />
          <h3 className="text-xl font-bold text-white">AI Coach</h3>
          {activeModel && (
            <span className="text-[10px] bg-blue-900/40 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded-full font-mono">
              {activeModel}
            </span>
          )}
        </div>
        {runtimeKey && (
          <button onClick={() => { setShowKeySetup(s => !s); setKeyInput(''); setKeyError(''); }}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
            <Key size={13} /> Change Key
          </button>
        )}
      </div>

      {showKeySetup && (
        <div className="m-4 mb-0 rounded-xl border border-blue-500/30 bg-blue-950/30 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Key className="text-blue-400 mt-0.5 shrink-0" size={16} />
            <div>
              <p className="text-sm font-semibold text-blue-200">Gemini API Key Required</p>
              <p className="text-xs text-gray-400 mt-0.5">Get a free key from Google AI Studio, then paste it below.</p>
            </div>
          </div>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 w-fit">
            <ExternalLink size={12} /> aistudio.google.com/app/apikey
          </a>
          <form onSubmit={handleSaveKey} className="flex gap-2">
            <input type="password" value={keyInput}
              onChange={e => { setKeyInput(e.target.value); setKeyError(''); setKeyValid(false); }}
              placeholder="Paste your AIza... key here"
              className="flex-1 bg-[#0f1929] border border-blue-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Save
            </button>
          </form>
          {keyError && <p className="text-xs text-red-400">{keyError}</p>}
          {keyValid && <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Key saved!</p>}
        </div>
      )}

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => !msg.text ? null : (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex items-start max-w-[85%] gap-2 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`p-2 rounded-full flex-shrink-0 ${msg.isBot ? (msg.isError ? 'bg-red-600/20 text-red-500' : 'bg-blue-600/20 text-blue-500') : 'bg-purple-600/20 text-purple-500'}`}>
                {msg.isBot ? (msg.isError ? <AlertCircle size={20} /> : <Bot size={20} />) : <User size={20} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed
                ${msg.isBot ? (msg.isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#2a2a2a] text-gray-200') : 'bg-blue-600 text-white'}
                ${msg.isBot ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {(isTyping || discovering) && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-full bg-blue-600/20 text-blue-500">
                {discovering ? <Loader size={20} className="animate-spin" /> : <Bot size={20} />}
              </div>
              <div className="p-3 rounded-2xl bg-[#2a2a2a] rounded-tl-none flex items-center gap-2">
                {discovering
                  ? <span className="text-xs text-gray-400">Finding best model for your key...</span>
                  : [0, 0.2, 0.4].map((d, i) => (
                      <div key={i} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                    ))
                }
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-800 flex gap-2 bg-[#222] rounded-b-2xl">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder={runtimeKey && !showKeySetup ? 'Ask for fitness advice...' : 'Enter your API key above to start...'}
          disabled={!runtimeKey || isTyping || showKeySetup}
          className="flex-1 bg-[#2d2d2d] border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40" />
        <button type="submit" disabled={!input.trim() || isTyping || !runtimeKey || showKeySetup}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
